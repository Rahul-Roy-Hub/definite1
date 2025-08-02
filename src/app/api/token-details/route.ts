import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// You'll need to add your 1inch API key here or in environment variables
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
    // Check if API key is configured
    if (!ONEINCH_API_KEY) {
      return NextResponse.json(
        { error: '1inch API key not configured. Please add ONEINCH_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = searchParams.get('chainId') || '1'; // Default to Ethereum

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Token address parameter is required' },
        { status: 400 }
      );
    }

    // Validate address format (basic check)
    if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid token address format' },
        { status: 400 }
      );
    }

    // Fetch token details from 1inch Token API
    const url = `${ONEINCH_TOKEN_BASE_URL}/${chainId}/custom/${tokenAddress}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'accept': 'application/json',
      },
    };

    console.log(`[DEBUG] Making request to: ${url}`);
    console.log(`[DEBUG] Headers:`, config.headers);
    
    const response = await fetchWithRetry(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching token details:`, response.status, errorText);
      
      // Return fallback data for demo purposes
      if (response.status === 404 || response.status === 401) {
        console.log('Returning fallback token data due to API error');
        return NextResponse.json({
          success: true,
          data: getFallbackTokenData(tokenAddress, parseInt(chainId)),
          timestamp: new Date().toISOString(),
          fallback: true,
          originalError: errorText
        });
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch token details',
          details: errorText,
          status: response.status,
          url: url
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform the data to match our expected format
    const transformedData = {
      address: tokenAddress,
      chainId: parseInt(chainId),
      symbol: data.symbol || 'UNKNOWN',
      name: data.name || 'Unknown Token',
      decimals: data.decimals || 18,
      logoURI: data.logoURI,
      verified: data.verified || false,
      tags: data.tags || [],
      price: data.price || 0,
      priceChange24h: data.priceChange24h || 0,
      volume24h: data.volume24h || 0,
      marketCap: data.marketCap || 0,
      totalSupply: data.totalSupply,
      coingeckoId: data.coingeckoId,
      description: data.description,
      website: data.website,
      twitter: data.twitter,
      telegram: data.telegram,
      github: data.github,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Token details API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getFallbackTokenData(tokenAddress: string, chainId: number) {
  // Fallback token data for demo purposes
  const fallbackTokens: Record<string, any> = {
    '0x0000000000000000000000000000000000000000': {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      verified: true,
      tags: ['native', 'layer-1'],
      price: 2500,
      priceChange24h: 2.5,
      volume24h: 15000000000,
      marketCap: 300000000000,
      totalSupply: '120000000',
      coingeckoId: 'ethereum',
      description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.',
      website: 'https://ethereum.org',
      twitter: 'https://twitter.com/ethereum',
      telegram: null,
      github: 'https://github.com/ethereum'
    },
    '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8': {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      verified: true,
      tags: ['stablecoin', 'usd'],
      price: 1,
      priceChange24h: 0.01,
      volume24h: 5000000000,
      marketCap: 25000000000,
      totalSupply: '25000000000',
      coingeckoId: 'usd-coin',
      description: 'USD Coin (USDC) is a stablecoin pegged to the US dollar.',
      website: 'https://www.circle.com/en/usdc',
      twitter: 'https://twitter.com/circle',
      telegram: null,
      github: null
    },
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      verified: true,
      tags: ['wrapped', 'bitcoin'],
      price: 45000,
      priceChange24h: -1.2,
      volume24h: 8000000000,
      marketCap: 90000000000,
      totalSupply: '2000000',
      coingeckoId: 'wrapped-bitcoin',
      description: 'Wrapped Bitcoin (WBTC) is an ERC-20 token backed 1:1 by Bitcoin.',
      website: 'https://www.wbtc.network',
      twitter: 'https://twitter.com/WrappedBTC',
      telegram: null,
      github: null
    }
  };

  return fallbackTokens[tokenAddress] || {
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    decimals: 18,
    logoURI: null,
    verified: false,
    tags: [],
    price: 0,
    priceChange24h: 0,
    volume24h: 0,
    marketCap: 0,
    totalSupply: null,
    coingeckoId: null,
    description: 'Token information not available',
    website: null,
    twitter: null,
    telegram: null,
    github: null
  };
} 