import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_TOKEN_BASE_URL = 'https://api.1inch.dev/token/v1.2';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retry logic
async function fetchWithRetry(url: string, config: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, config);
    
    if (response.status === 429) { // Rate limited
      if (retries > 0) {
        console.log(`Rate limited, retrying in ${RETRY_DELAY}ms... (${retries} retries left)`);
        await delay(RETRY_DELAY);
        return fetchWithRetry(url, config, retries - 1);
      } else {
        throw new Error('Rate limit exceeded after all retries');
      }
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying in ${RETRY_DELAY}ms... (${retries} retries left)`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, config, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '1';
    const tokenAddresses = searchParams.get('addresses');

    if (!tokenAddresses) {
      return NextResponse.json(
        { error: 'Token addresses parameter is required' },
        { status: 400 }
      );
    }

    // Split addresses by comma and take first 5 to avoid rate limits
    const addresses = tokenAddresses.split(',').slice(0, 5);
    
    // Fetch token metadata from 1inch Token API
    // According to docs: https://portal.1inch.dev/documentation/apis/tokens/quick-start
    // The format should be: /v1.2/{chain_id}/custom/{addresses}
    // But we need to handle each address separately to avoid the "wrong address" error
    const results = [];
    
    for (const address of addresses) {
      try {
        const url = `${ONEINCH_TOKEN_BASE_URL}/${chainId}/custom/${address}`;
        
        const config = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ONEINCH_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        };

        console.log(`[DEBUG] Making Token API request to: ${url}`);
        
        const response = await fetchWithRetry(url, config);
        
        if (response.ok) {
          const data = await response.json();
          results.push(data);
        } else {
          console.log(`[DEBUG] Failed to fetch token ${address}: ${response.status}`);
        }
        
        // Add delay between requests to avoid rate limiting
        await delay(500);
      } catch (error) {
        console.error(`[DEBUG] Error fetching token ${address}:`, error);
      }
    }
    
    console.log('[DEBUG] Token API responses received:', results.length, 'tokens');
    
    // Flatten the results array
    const flattenedData = results.flat();
    
    return NextResponse.json({
      success: true,
      data: flattenedData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 