import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') || '1';

    if (!address) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    const ONE_INCH_API_KEY = process.env.ONEINCH_API_KEY;

    if (!ONE_INCH_API_KEY) {
        return NextResponse.json(
            { error: 'Server API key not configured' },
            { status: 500 }
        );
    }

    const url = `https://api.1inch.dev/balance/v1.2/${chainId}/balances/${address}`;

    const config = {
        headers: {
            Authorization: `Bearer ${ONE_INCH_API_KEY}`,
            accept: 'application/json',
        },
    };

    try {
        const response = await axios.get(url, config);
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(
            'Error fetching wallet balance from 1inch:',
            error.response?.data || error.message
        );
        return NextResponse.json(
            { error: 'Failed to fetch wallet balance' },
            { status: error.response?.status || 500 }
        );
    }
}
