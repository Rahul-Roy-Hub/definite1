import { NextRequest, NextResponse } from 'next/server';
import { OneInchPortfolioResponse, SUPPORTED_CHAINS, PortfolioSummary } from '@/lib/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// You'll need to add your 1inch API key here or in environment variables
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev/portfolio/portfolio/v5.0';

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

    // Fetch portfolio data for all requested chains
    const portfolioPromises = chainIds.map(async (chainId) => {
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

      try {
        const response = await fetch(`${url}?${params}`, config);
        
        if (!response.ok) {
          console.error(`Error fetching data for chain ${chainId}:`, response.statusText);
          return null;
        }

        const data: OneInchPortfolioResponse = await response.json();
        return {
          chainId: parseInt(chainId),
          data: data.result,
        };
      } catch (error) {
        console.error(`Error fetching data for chain ${chainId}:`, error);
        return null;
      }
    });

    const portfolioResults = await Promise.all(portfolioPromises);
    const validResults = portfolioResults.filter(result => result !== null);

    if (validResults.length === 0) {
      return NextResponse.json(
        { error: 'No portfolio data found for any supported chains' },
        { status: 404 }
      );
    }

    // Aggregate data across all chains
    const aggregatedData = aggregatePortfolioData(validResults);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      timestamp: new Date().toISOString(),
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
