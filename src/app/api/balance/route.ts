import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// You'll need to add your 1inch API key here or in environment variables
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev/balance/v1.2';

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
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') || '1'; // Default to Ethereum
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Define supported chains for cross-chain portfolio (focusing on major chains first)
    const supportedChains = [
      { id: '1', name: 'Ethereum' },
      { id: '56', name: 'BNB Chain' },
      { id: '137', name: 'Polygon' },
      { id: '42161', name: 'Arbitrum One' },
      { id: '10', name: 'Optimism' },
      { id: '8453', name: 'Base' },
    ];

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

    // Fetch token balances from multiple chains for cross-chain portfolio
    const allTokens: any[] = [];
    const chainResults: any[] = [];
    
    for (const chain of supportedChains) {
      try {
        const url = `${ONEINCH_BASE_URL}/${chain.id}/balances/${address}`;
        
        const config = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ONEINCH_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        };

        console.log(`[DEBUG] Making request to: ${url}`);
        
        const response = await fetchWithRetry(url, config);
        
        if (response.ok) {
          const data = await response.json();
          const tokenAddresses = Object.keys(data || {});
          
          console.log(`[DEBUG] ${chain.name} (${chain.id}): Found ${tokenAddresses.length} tokens`);
          
          if (tokenAddresses.length > 0) {
            // Convert to array format and add chain info
            const tokensArray = tokenAddresses.map(tokenAddress => ({
              address: tokenAddress,
              balance: data[tokenAddress],
              symbol: 'Unknown',
              name: 'Unknown Token',
              decimals: 18,
              price: 0,
              logoURI: null,
              chainId: parseInt(chain.id),
              chainName: chain.name,
            }));
            
            // Filter tokens with balance > 0
            const tokensWithBalance = tokensArray.filter(token => parseFloat(token.balance) > 0);
            
            console.log(`[DEBUG] ${chain.name}: ${tokensWithBalance.length} tokens with balance > 0`);
            
            if (tokensWithBalance.length > 0) {
              allTokens.push(...tokensWithBalance);
              chainResults.push({
                chainId: parseInt(chain.id),
                chainName: chain.name,
                tokenCount: tokensWithBalance.length,
              });
              console.log(`[DEBUG] Added ${tokensWithBalance.length} tokens from ${chain.name}`);
            }
          } else {
            console.log(`[DEBUG] ${chain.name}: No tokens found`);
          }
        } else {
          const errorText = await response.text();
          console.log(`[DEBUG] Failed to fetch from ${chain.name} (${chain.id}): ${response.status} - ${errorText}`);
        }
        
        // Add delay between chain requests to avoid rate limiting
        await delay(200);
      } catch (error) {
        console.error(`[DEBUG] Error fetching from ${chain.name}:`, error);
      }
    }
    
    console.log(`[DEBUG] Found ${allTokens.length} total tokens across ${chainResults.length} chains`);
    console.log('[DEBUG] Chain results:', chainResults);
    
    // If no tokens found across all chains, return fallback data
    if (allTokens.length === 0) {
      console.log('[DEBUG] No tokens found across all chains, using fallback data');
      return NextResponse.json({
        success: true,
        data: getFallbackData(address, parseInt(chainId)),
        timestamp: new Date().toISOString(),
        fallback: true,
        reason: 'No tokens found across all chains - showing demo data'
      });
    }
    
    // Process tokens with basic data from Balance API
    const enhancedTokens = allTokens.map((token: any) => {
      const balance = parseFloat(token.balance || '0');
      const balanceFormatted = formatTokenBalance(token.balance || '0', token.decimals || 18);
      
      return {
        symbol: token.symbol || 'Unknown',
        name: token.name || 'Unknown Token',
        address: token.address,
        decimals: token.decimals || 18,
        balance: token.balance || '0',
        balanceFormatted,
        price: 0, // No price data available
        value: 0, // No price data available
        valueFormatted: '$0.00',
        logoURI: token.logoURI,
        verified: false,
        tags: [],
        priceChange24h: 0,
        volume24h: 0,
        marketCap: 0,
        totalSupply: null,
        chainId: token.chainId,
        chainName: token.chainName,
      };
    });
    
    // Filter out tokens with zero balance and sort by balance (highest first)
    const filteredAndSortedTokens = enhancedTokens
      .filter((token: any) => parseFloat(token.balance) > 0) // Only tokens with balance > 0
      .sort((a: any, b: any) => parseFloat(b.balance || '0') - parseFloat(a.balance || '0')) // Sort by balance descending
      .slice(0, 50); // Take top 50 tokens across all chains
    
    console.log(`[DEBUG] Filtered to ${filteredAndSortedTokens.length} tokens with balance > 0`);
    
    // Fetch token metadata and prices for the top tokens
    if (filteredAndSortedTokens.length > 0) {
      try {
        const tokenAddresses = filteredAndSortedTokens.map(token => token.address).join(',');
        
        // Fetch token metadata
        const tokenMetadataUrl = new URL('/api/tokens', request.url);
        tokenMetadataUrl.searchParams.set('addresses', tokenAddresses);
        tokenMetadataUrl.searchParams.set('chainId', chainId);
        
        console.log(`[DEBUG] Fetching metadata for ${filteredAndSortedTokens.length} tokens`);
        
        const tokenMetadataResponse = await fetch(tokenMetadataUrl.toString());
        let tokenMetadataMap = new Map();
        
        if (tokenMetadataResponse.ok) {
          const tokenMetadataData = await tokenMetadataResponse.json();
          console.log('[DEBUG] Token metadata received:', tokenMetadataData.data);
          
          // Create a map of token addresses to metadata
          if (tokenMetadataData.data && Array.isArray(tokenMetadataData.data)) {
            tokenMetadataData.data.forEach((token: any) => {
              if (token.address) {
                tokenMetadataMap.set(token.address.toLowerCase(), token);
              }
            });
          }
        }
        
        // Fetch price data
        const priceUrl = new URL('/api/prices', request.url);
        priceUrl.searchParams.set('addresses', tokenAddresses);
        
        console.log(`[DEBUG] Fetching prices for ${filteredAndSortedTokens.length} tokens`);
        
        const priceResponse = await fetch(priceUrl.toString());
        let priceMap: { [key: string]: any } = {};
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log('[DEBUG] Price data received:', priceData.data);
          priceMap = priceData.data || {};
        }
        
        // Enhance tokens with metadata and prices
        const enhancedTokensWithData = filteredAndSortedTokens.map(token => {
          const metadata = tokenMetadataMap.get(token.address.toLowerCase());
          const priceData = priceMap[token.address.toLowerCase()];
          
          const balance = parseFloat(token.balance || '0');
          const price = priceData?.price || 0;
          const value = balance * price;
          
          return {
            ...token,
            symbol: metadata?.symbol || token.symbol || 'Unknown',
            name: metadata?.name || token.name || 'Unknown Token',
            logoURI: metadata?.logoURI || token.logoURI,
            verified: metadata?.verified || false,
            tags: metadata?.tags || [],
            price: price,
            value: value,
            valueFormatted: formatCurrency(value),
            priceChange24h: priceData?.priceChange24h || 0,
            volume24h: priceData?.volume24h || 0,
            marketCap: priceData?.marketCap || 0,
            totalSupply: metadata?.totalSupply || null,
          };
        });
        
        // Update the tokens array
        filteredAndSortedTokens.splice(0, filteredAndSortedTokens.length, ...enhancedTokensWithData);
      } catch (error) {
        console.error('[DEBUG] Error fetching token data:', error);
        // Continue with basic token data if metadata/price fetch fails
      }
    }
     
           // Transform the data to match our expected format
      const totalValue = filteredAndSortedTokens.reduce((sum: number, token: any) => 
        sum + (token.value || 0), 0
      );
      
      const transformedData = {
        address: address,
        chainId: parseInt(chainId),
        tokens: filteredAndSortedTokens,
        totalValue: totalValue,
        totalValueFormatted: formatCurrency(totalValue),
      };

    return NextResponse.json({
      success: true,
      data: transformedData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Balance API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function formatTokenBalance(balance: string, decimals: number): string {
  const numBalance = parseFloat(balance) / Math.pow(10, decimals);
  
  // Handle very large numbers with better formatting
  if (numBalance >= 1000000) {
    return (numBalance / 1000000).toFixed(2) + 'M';
  } else if (numBalance >= 1000) {
    return (numBalance / 1000).toFixed(2) + 'K';
  } else if (numBalance >= 1) {
    return numBalance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  } else {
    return numBalance.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    });
  }
}

function formatCurrency(value: number): string {
  // Handle very large values
  if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(2) + 'B';
  } else if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(2) + 'K';
  } else if (value >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } else if (value >= 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(value);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(value);
  }
}

function getFallbackData(address: string, chainId: number) {
  // Sample token data for demo purposes with cross-chain tokens
  const sampleTokens = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: '2500000000000000000', // 2.5 ETH
      balanceFormatted: '2.500000',
      price: 2500,
      value: 6250,
      valueFormatted: '$6,250.00',
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      verified: true,
      tags: ['native', 'layer-1'],
      priceChange24h: 2.5,
      volume24h: 15000000000,
      marketCap: 300000000000,
      totalSupply: '120000000',
      chainId: 1,
      chainName: 'Ethereum'
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: '1000000000000000000', // 1 BNB
      balanceFormatted: '1.000000',
      price: 300,
      value: 300,
      valueFormatted: '$300.00',
      logoURI: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
      verified: true,
      tags: ['native', 'layer-1'],
      priceChange24h: 1.2,
      volume24h: 8000000000,
      marketCap: 45000000000,
      totalSupply: '150000000',
      chainId: 56,
      chainName: 'BNB Chain'
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: '5000000000000000000000', // 5000 MATIC
      balanceFormatted: '5000.000000',
      price: 0.8,
      value: 4000,
      valueFormatted: '$4,000.00',
      logoURI: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
      verified: true,
      tags: ['native', 'layer-2'],
      priceChange24h: -0.5,
      volume24h: 3000000000,
      marketCap: 8000000000,
      totalSupply: '10000000000',
      chainId: 137,
      chainName: 'Polygon'
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: '2000000000000000000000', // 2000 ARB
      balanceFormatted: '2000.000000',
      price: 1.2,
      value: 2400,
      valueFormatted: '$2,400.00',
      logoURI: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21-47-00.jpg',
      verified: true,
      tags: ['native', 'layer-2'],
      priceChange24h: 3.1,
      volume24h: 1200000000,
      marketCap: 1200000000,
      totalSupply: '10000000000',
      chainId: 42161,
      chainName: 'Arbitrum One'
    },
    {
      symbol: 'OP',
      name: 'Optimism',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: '1000000000000000000000', // 1000 OP
      balanceFormatted: '1000.000000',
      price: 2.5,
      value: 2500,
      valueFormatted: '$2,500.00',
      logoURI: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
      verified: true,
      tags: ['native', 'layer-2'],
      priceChange24h: 1.8,
      volume24h: 800000000,
      marketCap: 2000000000,
      totalSupply: '4294967296',
      chainId: 10,
      chainName: 'Optimism'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8',
      decimals: 6,
      balance: '5000000', // 5 USDC
      balanceFormatted: '5.000000',
      price: 1,
      value: 5,
      valueFormatted: '$5.00',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      verified: true,
      tags: ['stablecoin', 'usd'],
      priceChange24h: 0.01,
      volume24h: 5000000000,
      marketCap: 25000000000,
      totalSupply: '25000000000',
      chainId: 1,
      chainName: 'Ethereum'
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      balance: '50000', // 0.0005 WBTC
      balanceFormatted: '0.000500',
      price: 45000,
      value: 22.5,
      valueFormatted: '$22.50',
      logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      verified: true,
      tags: ['wrapped', 'bitcoin'],
      priceChange24h: -1.2,
      volume24h: 8000000000,
      marketCap: 90000000000,
      totalSupply: '2000000'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      balance: '10000000', // 10 USDT
      balanceFormatted: '10.000000',
      price: 1,
      value: 10,
      valueFormatted: '$10.00',
      logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      verified: true,
      tags: ['stablecoin', 'usd'],
      priceChange24h: 0.01,
      volume24h: 60000000000,
      marketCap: 95000000000,
      totalSupply: '95000000000'
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      balance: '5000000000000000000000', // 5000 DAI
      balanceFormatted: '5000.000000',
      price: 1,
      value: 5000,
      valueFormatted: '$5,000.00',
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      verified: true,
      tags: ['stablecoin', 'defi'],
      priceChange24h: 0.02,
      volume24h: 2000000000,
      marketCap: 5000000000,
      totalSupply: '5000000000'
    },
    {
      symbol: 'AAVE',
      name: 'Aave',
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      decimals: 18,
      balance: '100000000000000000000', // 100 AAVE
      balanceFormatted: '100.000000',
      price: 85,
      value: 8500,
      valueFormatted: '$8,500.00',
      logoURI: 'https://assets.coingecko.com/coins/images/12645/small/AAVE_token_blue.png',
      verified: true,
      tags: ['defi', 'lending'],
      priceChange24h: 5.8,
      volume24h: 1500000000,
      marketCap: 12000000000,
      totalSupply: '16000000',
      chainId: 1,
      chainName: 'Ethereum'
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      balance: '500000000000000000000', // 500 UNI
      balanceFormatted: '500.000000',
      price: 7.5,
      value: 3750,
      valueFormatted: '$3,750.00',
      logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
      verified: true,
      tags: ['defi', 'dex'],
      priceChange24h: -2.1,
      volume24h: 800000000,
      marketCap: 4500000000,
      totalSupply: '1000000000',
      chainId: 1,
      chainName: 'Ethereum'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      decimals: 18,
      balance: '1000000000000000000000', // 1000 LINK
      balanceFormatted: '1000.000000',
      price: 12.5,
      value: 12500,
      valueFormatted: '$12,500.00',
      logoURI: 'https://assets.coingecko.com/coins/images/877/small/chainlink.png',
      verified: true,
      tags: ['oracle', 'defi'],
      priceChange24h: 3.4,
      volume24h: 1200000000,
      marketCap: 7000000000,
      totalSupply: '1000000000',
      chainId: 1,
      chainName: 'Ethereum'
    },
    {
      symbol: 'CRV',
      name: 'Curve DAO Token',
      address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
      decimals: 18,
      balance: '2000000000000000000000', // 2000 CRV
      balanceFormatted: '2000.000000',
      price: 0.65,
      value: 1300,
      valueFormatted: '$1,300.00',
      logoURI: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png',
      verified: true,
      tags: ['defi', 'amm'],
      priceChange24h: -0.8,
      volume24h: 300000000,
      marketCap: 700000000,
      totalSupply: '2000000000',
      chainId: 1,
      chainName: 'Ethereum'
    },
    {
      symbol: 'MKR',
      name: 'Maker',
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      decimals: 18,
      balance: '5000000000000000000', // 5 MKR
      balanceFormatted: '5.000000',
      price: 1200,
      value: 6000,
      valueFormatted: '$6,000.00',
      logoURI: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png',
      verified: true,
      tags: ['defi', 'governance'],
      priceChange24h: 1.7,
      volume24h: 50000000,
      marketCap: 1100000000,
      totalSupply: '1000000',
      chainId: 1,
      chainName: 'Ethereum'
    }
  ];

  const totalValue = sampleTokens.reduce((sum, token) => sum + token.value, 0);

  return {
    address,
    chainId,
    tokens: sampleTokens,
    totalValue,
    totalValueFormatted: formatCurrency(totalValue),
  };
} 