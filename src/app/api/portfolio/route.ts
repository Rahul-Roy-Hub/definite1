import { NextRequest, NextResponse } from 'next/server';
import { OneInchPortfolioResponse, SUPPORTED_CHAINS, PortfolioSummary } from '@/lib/types';
import { serverCache } from '@/lib/server-cache';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// You'll need to add your 1inch API key here or in environment variables
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev/portfolio/portfolio/v5.0';

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

// Helper function to get chain name
function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
    10: 'Optimism',
  };
  return chainNames[chainId] || 'Unknown';
}

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: '1inch API key not configured. Please add ONEINCH_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainIds = searchParams.get('chainIds')?.split(',') || Object.values(SUPPORTED_CHAINS).map(String);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Validate address format (basic check)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cacheKey = serverCache.generatePortfolioKey(address, chainIds);
      console.log(`[CACHE DEBUG] Generated cache key: ${cacheKey}`);
      console.log(`[CACHE DEBUG] Address: ${address}, ChainIds: ${chainIds.join(',')}`);
      
      const cacheInfo = serverCache.getCacheInfo(cacheKey);
      if (cacheInfo) {
        console.log(`[CACHE DEBUG] Cache entry info:`, cacheInfo);
      }
      
      const cachedData = serverCache.get(cacheKey);
      if (cachedData) {
        console.log(`[CACHE HIT] Serving portfolio data from cache for address: ${address}`);
        return NextResponse.json({
          success: true,
          data: cachedData,
          timestamp: new Date().toISOString(),
          cached: true,
        });
      } else {
        console.log(`[CACHE MISS] No cached data found for address: ${address}`);
        console.log(`[CACHE DEBUG] Cache size: ${serverCache.getCacheSize()}`);
        console.log(`[CACHE DEBUG] Cache keys: ${serverCache.getCacheKeys().join(', ')}`);
      }
    } else {
      console.log(`[FORCE REFRESH] Bypassing cache for address: ${address}`);
    }

    // Fetch portfolio data sequentially with rate limiting
    const portfolioResults: Array<{ chainId: number; data: any }> = [];
    const errors: string[] = [];

    for (const chainId of chainIds) {
      try {
        // Add delay between requests to respect rate limits
        if (portfolioResults.length > 0) {
          await delay(RATE_LIMIT_DELAY);
        }

        const url = `${ONEINCH_BASE_URL}/general/current_value`;
        
        const config = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ONEINCH_API_KEY}`,
            'Content-Type': 'application/json',
          },
        };

        const params = new URLSearchParams({
          addresses: address,
          chain_id: chainId,
          use_cache: 'true',
        });

        const response = await fetchWithRetry(`${url}?${params}`, config);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching data for chain ${chainId}:`, response.status, errorText);
          
          // Handle specific error types
          if (response.status === 503) {
            console.log(`Chain ${chainId} temporarily unavailable (503), skipping...`);
            errors.push(`Chain ${chainId}: Temporarily unavailable`);
          } else {
            errors.push(`Chain ${chainId}: ${response.statusText}`);
          }
          continue;
        }

        const data: OneInchPortfolioResponse = await response.json();
        portfolioResults.push({
          chainId: parseInt(chainId),
          data: data.result,
        });

        console.log(`Successfully fetched data for chain ${chainId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching data for chain ${chainId}:`, errorMessage);
        errors.push(`Chain ${chainId}: ${errorMessage}`);
      }
    }

    if (portfolioResults.length === 0) {
      return NextResponse.json(
        { 
          error: 'No portfolio data found for any supported chains',
          details: errors
        },
        { status: 404 }
      );
    }

    // Add fallback data for chains that failed to fetch
    const failedChainIds = chainIds.filter(chainId => 
      !portfolioResults.some(result => result.chainId === parseInt(chainId))
    );

    if (failedChainIds.length > 0) {
      console.log(`Adding fallback data for failed chains: ${failedChainIds.join(', ')}`);
      
      // Add minimal fallback data for failed chains
      failedChainIds.forEach(chainId => {
        const chainIdNum = parseInt(chainId);
        portfolioResults.push({
          chainId: chainIdNum,
          data: {
            total: 0,
            by_chain: [{
              chain_id: chainIdNum,
              chain_name: getChainName(chainIdNum),
              value_usd: 0
            }],
            by_category: [{
              category_id: 'tokens',
              category_name: 'Tokens',
              value_usd: 0
            }]
          }
        });
      });
    }

    // Aggregate data across all chains
    const aggregatedData = aggregatePortfolioData(portfolioResults);

    // Cache the result
    const cacheKey = serverCache.generatePortfolioKey(address, chainIds);
    serverCache.set(cacheKey, aggregatedData);
    console.log(`[CACHE SET] Cached portfolio data for address: ${address}`);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      timestamp: new Date().toISOString(),
      warnings: errors.length > 0 ? errors : undefined,
      cached: false,
    });

  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function aggregatePortfolioData(results: any[]): PortfolioSummary {
  let totalValue = 0;
  const chainMap = new Map();
  const categoryMap = new Map();

  results.forEach(({ chainId, data }) => {
    totalValue += data.total;

    // Aggregate by chain
    data.by_chain.forEach((chain: any) => {
      const existing = chainMap.get(chain.chain_id) || { 
        chainId: chain.chain_id, 
        chainName: chain.chain_name, 
        value: 0 
      };
      existing.value += chain.value_usd;
      chainMap.set(chain.chain_id, existing);
    });

    // Aggregate by category
    data.by_category.forEach((category: any) => {
      const existing = categoryMap.get(category.category_id) || {
        categoryId: category.category_id,
        categoryName: category.category_name,
        value: 0
      };
      existing.value += category.value_usd;
      categoryMap.set(category.category_id, existing);
    });
  });

  return {
    totalValue,
    totalValueFormatted: formatCurrency(totalValue),
    chains: Array.from(chainMap.values()).map(chain => ({
      chainId: chain.chainId,
      chainName: chain.chainName,
      value: chain.value,
      valueFormatted: formatCurrency(chain.value),
    })),
    categories: Array.from(categoryMap.values()).map(category => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      value: category.value,
      valueFormatted: formatCurrency(category.value),
    })),
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
