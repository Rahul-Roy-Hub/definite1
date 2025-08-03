import { NextRequest, NextResponse } from 'next/server';

const CHAIN_ID_MAP: Record<string, number> = {
    'ethereum': 1,
    'polygon': 137,
    'arbitrum': 42161,
    'optimism': 10,
    'base': 8453,
};

const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    'ethereum': {
        'USDC': '0xA0b86a33E6441E6516De68F8Cf8F8088b1E9D73f',
        'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
        'DAI': '0x6b175474e89094c44da98b954eedeac495271d0f',
        'WETH': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        'ETH': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    'polygon': {
        'USDC': '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        'USDT': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        'DAI': '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        'WETH': '0x7ceb23fd6c94faf4c5da1a4b4da6b2c3e2a1e95b'
    },
    'arbitrum': {
        'USDC': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        'USDT': '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        'DAI': '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        'WETH': '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
    },
    'optimism': {
        'USDC': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
        'USDT': '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        'DAI': '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        'WETH': '0x4200000000000000000000000000000000000006'
    },
    'base': {
        'USDC': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        'USDT': '0xfde4c96c8593536e31f229ea1f71d1b7c9bb4c8a',
        'DAI': '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
        'WETH': '0x4200000000000000000000000000000000000006'
    }
};

const TOKEN_DECIMALS: Record<string, number> = {
    'USDC': 6,
    'USDT': 6,
    'DAI': 18,
    'WETH': 18,
    'ETH': 18
};

interface QuoteParams {
    srcChain: string;
    dstChain: string;
    srcToken: string;
    dstToken: string;
    amount: string;
    walletAddress?: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const srcChain = searchParams.get('srcChain');
        const dstChain = searchParams.get('dstChain');
        const srcToken = searchParams.get('srcToken');
        const dstToken = searchParams.get('dstToken');
        const amount = searchParams.get('amount');
        const walletAddress = searchParams.get('walletAddress') || '0x266E77cE9034a023056ea2845CB6A20517F6FDB7';

        if (!srcChain || !dstChain || !srcToken || !dstToken || !amount) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const srcChainId = CHAIN_ID_MAP[srcChain];
        const dstChainId = CHAIN_ID_MAP[dstChain];

        if (!srcChainId || !dstChainId) {
            return NextResponse.json(
                { error: 'Unsupported chain' },
                { status: 400 }
            );
        }

        const srcTokenAddress = TOKEN_ADDRESSES[srcChain]?.[srcToken];
        const dstTokenAddress = TOKEN_ADDRESSES[dstChain]?.[dstToken];

        if (!srcTokenAddress || !dstTokenAddress) {
            return NextResponse.json(
                {
                    error: 'Unsupported token for selected chains',
                    details: `${srcToken} on ${srcChain} or ${dstToken} on ${dstChain} not supported`
                },
                { status: 400 }
            );
        }

        const srcTokenDecimals = TOKEN_DECIMALS[srcToken] || 18;
        const dstTokenDecimals = TOKEN_DECIMALS[dstToken] || 18;
        const amountInWei = (parseFloat(amount) * Math.pow(10, srcTokenDecimals)).toString();

        const apiUrl = new URL('https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/receive');
        apiUrl.searchParams.set('srcChain', srcChainId.toString());
        apiUrl.searchParams.set('dstChain', dstChainId.toString());
        apiUrl.searchParams.set('srcTokenAddress', srcTokenAddress);
        apiUrl.searchParams.set('dstTokenAddress', dstTokenAddress);
        apiUrl.searchParams.set('amount', amountInWei);
        apiUrl.searchParams.set('walletAddress', walletAddress);
        apiUrl.searchParams.set('enableEstimate', 'false');
        apiUrl.searchParams.set('fee', '0');

        const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
                'accept': 'application/json',
                'content-type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('1inch API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch quote from 1inch API', details: errorText },
                { status: response.status }
            );
        }

        const quoteData = await response.json();

        const processedQuote = {
            ...quoteData,
            srcTokenAmountFormatted: (parseFloat(quoteData.srcTokenAmount) / Math.pow(10, srcTokenDecimals)).toFixed(6),
            dstTokenAmountFormatted: (parseFloat(quoteData.dstTokenAmount) / Math.pow(10, dstTokenDecimals)).toFixed(6),
            srcToken: srcToken,
            dstToken: dstToken,
            srcChain: srcChain,
            dstChain: dstChain,
            estimatedFeeUsd: quoteData.volume?.usd?.srcToken ?
                (parseFloat(quoteData.volume.usd.srcToken) * 0.003).toFixed(2) : '0.00',
            priceImpact: quoteData.priceImpactPercent || 0,
            exchangeRate: quoteData.srcTokenAmount && quoteData.dstTokenAmount ?
                (parseFloat(quoteData.dstTokenAmount) / parseFloat(quoteData.srcTokenAmount)).toFixed(6) : '0',
        };

        return NextResponse.json(processedQuote);

    } catch (error) {
        console.error('Cross-chain quote API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
