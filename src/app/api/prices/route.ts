import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// CoinGecko API for price data
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

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

// Token address to CoinGecko ID mapping for popular tokens
const TOKEN_MAPPING: { [key: string]: string } = {
  // Ethereum
  '0x0000000000000000000000000000000000000000': 'ethereum',
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ethereum',
  
  // USDC
  '0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8': 'usd-coin',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
  
  // USDT
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
  
  // WBTC
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin',
  
  // DAI
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
  
  // AAVE
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
  
  // UNI
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
  
  // LINK
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
  
  // CRV
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 'curve-dao-token',
  
  // MKR
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker',
  
  // WETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'weth',
  
  // SHIB
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': 'shiba-inu',
  
  // PEPE
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': 'pepe',
  
  // MATIC
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'matic-network',
  
  // LDO
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32': 'lido-dao',
  
  // ARB
  '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1': 'arbitrum',
  
  // OP
  '0x4200000000000000000000000000000000000042': 'optimism',
  
  // BNB
  '0xb8c77482e45f1f44de1745f52c74426c631bdd52': 'binancecoin',
  
  // SOL
  '0xd31a59c85ae9d8edefec411d448f90841571b89c': 'solana',
  
  // ADA
  '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47': 'cardano',
  
  // DOT
  '0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4d5d': 'polkadot',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddresses = searchParams.get('addresses');

    if (!tokenAddresses) {
      return NextResponse.json(
        { error: 'Token addresses parameter is required' },
        { status: 400 }
      );
    }

    // Split addresses and get their CoinGecko IDs
    const addresses = tokenAddresses.split(',');
    const coinIds = addresses
      .map(addr => TOKEN_MAPPING[addr.toLowerCase()])
      .filter(id => id); // Remove undefined values

    if (coinIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch prices from CoinGecko
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    
    const config = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    console.log(`[DEBUG] Making CoinGecko API request to: ${url}`);
    
    const response = await fetchWithRetry(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching price data:`, response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch price data',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[DEBUG] CoinGecko API response received');

    // Create a mapping of token addresses to price data
    const priceMap: { [key: string]: any } = {};
    
    addresses.forEach((address, index) => {
      const coinId = coinIds[index];
      if (coinId && data[coinId]) {
        priceMap[address.toLowerCase()] = {
          price: data[coinId].usd,
          priceChange24h: data[coinId].usd_24h_change,
          volume24h: data[coinId].usd_24h_vol,
          marketCap: data[coinId].usd_market_cap,
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: priceMap,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 