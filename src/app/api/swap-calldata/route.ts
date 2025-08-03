import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const src = searchParams.get('src');
    const dst = searchParams.get('dst');
    const amount = searchParams.get('amount');
    const from = searchParams.get('from');
    const origin = searchParams.get('origin');
    const slippage = searchParams.get('slippage') || '3';
    const fee = searchParams.get('fee') || '0';
    const complexityLevel = searchParams.get('complexityLevel') || '1';
    const parts = searchParams.get('parts') || '1';
    const mainRouteParts = searchParams.get('mainRouteParts') || '1';
    const gasLimit = searchParams.get('gasLimit') || '100000';

    // console.log('Swap API params:', { src, dst, amount, from, origin, slippage });

    if (!src || !dst || !amount || !from || !origin) {
      return NextResponse.json(
        { error: 'Missing required parameters: src, dst, amount, from, origin' },
        { status: 400 }
      );
    }

    if (!process.env.ONEINCH_API_KEY) {
      // console.error('ONEINCH_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const url = 'https://api.1inch.dev/swap/v6.1/1/swap';

    const queryParams = new URLSearchParams();
    queryParams.append('src', src);
    queryParams.append('dst', dst);
    queryParams.append('amount', amount);
    queryParams.append('from', from);
    queryParams.append('origin', origin);
    queryParams.append('slippage', slippage);

    if (fee !== '0') queryParams.append('fee', fee);
    if (complexityLevel !== '1') queryParams.append('complexityLevel', complexityLevel);
    if (parts !== '1') queryParams.append('parts', parts);
    if (mainRouteParts !== '1') queryParams.append('mainRouteParts', mainRouteParts);
    if (gasLimit !== '100000') queryParams.append('gasLimit', gasLimit);

    const fullUrl = `${url}?${queryParams.toString()}`;
    // console.log('Calling 1inch swap API:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    });

    // console.log('1inch swap API response status:', response.status);

    const responseText = await response.text();
    // console.log('Raw swap response:', responseText);

    if (!response.ok) {
      // console.error('1inch swap API error response:', responseText);
      return NextResponse.json(
        { error: `1inch API error: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);
      // console.log('1inch swap API response data:', data);
      return NextResponse.json(data);
    } catch (parseError) {
      // console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse API response', rawResponse: responseText },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // console.error('Swap API route error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
