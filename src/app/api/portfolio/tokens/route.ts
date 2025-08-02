import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CHAINS } from '@/lib/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev/portfolio/portfolio/v5.0';

interface TokenDetails {
  abs_amount: string;
  amount: string;
  price_to_usd: number;
  value_usd: number;
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo_uri?: string;
  };
}

interface DetailedPortfolioResponse {
  result: {
    total: number;
    by_address: Array<{
      value_usd: number;
      address: string;
      tokens: TokenDetails[];
    }>;
  };
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
    const chainId = searchParams.get('chainId') || '1'; // Default to Ethereum

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    const url = `${ONEINCH_BASE_URL}/general/detailed`;
    
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
      use_cache: 'true', // Enable caching
    });

    const response = await fetch(`${url}?${params}`, config);
    
    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (response.status >= 500) {
        return NextResponse.json(
          { error: '1inch API service temporarily unavailable' },
          { status: 503 }
        );
      }
      console.error(`Error fetching detailed portfolio:`, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch token details from 1inch API' },
        { status: response.status }
      );
    }

    const data: DetailedPortfolioResponse = await response.json();

    // Transform the data into our format
    const tokens = data.result.by_address[0]?.tokens || [];
    
    const formattedTokens = tokens
      .filter(token => token.value_usd > 0.01) // Filter out dust
      .sort((a, b) => b.value_usd - a.value_usd) // Sort by value
      .map(token => ({
        symbol: token.token.symbol,
        name: token.token.name,
        balance: parseFloat(token.amount).toFixed(4),
        value: formatCurrency(token.value_usd),
        price: formatCurrency(token.price_to_usd),
        change: generateMockChange(), // Mock change for now
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
        address: token.token.address,
        logo: token.token.logo_uri,
        chainId: parseInt(chainId),
      }));

    return NextResponse.json({
      success: true,
      data: {
        tokens: formattedTokens,
        totalValue: data.result.total,
        chainId: parseInt(chainId),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Token details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function generateMockChange(): string {
  const isPositive = Math.random() > 0.4; // 60% positive changes
  const change = (Math.random() * 20).toFixed(2);
  return `${isPositive ? '+' : '-'}${change}%`;
}
