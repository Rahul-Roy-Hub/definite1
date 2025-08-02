import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const src = searchParams.get('src');
    const dst = searchParams.get('dst');
    const amount = searchParams.get('amount');

    // console.log('Quote API params:', { src, dst, amount });

    if (!src || !dst || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: src, dst, amount' },
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

    const url = 'https://api.1inch.dev/swap/v6.1/1/quote';
    const queryParams = new URLSearchParams({
      src: src,
      dst: dst,
      amount: amount
    });

    const fullUrl = `${url}?${queryParams.toString()}`;
    // console.log('Full URL:', fullUrl);
    // console.log('API Key:', process.env.ONEINCH_API_KEY ? 'Present' : 'Missing');

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
    });

    // console.log('Response status:', response.status);
    // console.log('Response headers:', Object.fromEntries(response.headers));

    const responseText = await response.text();
    // console.log('Raw response:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        error: `API error: ${response.status}`,
        details: responseText,
        url: fullUrl
      }, { status: response.status });
    }

    try {
      const data = JSON.parse(responseText);
      // console.log('Quote API response data:', data);
      return NextResponse.json(data);
    } catch (parseError) {
      return NextResponse.json({
        error: 'Failed to parse JSON response',
        rawResponse: responseText,
        url: fullUrl
      }, { status: 500 });
    }

  } catch (error: any) {
    // console.error('Quote API route error:', error);
    return NextResponse.json({
      error: `Server error: ${error.message}`,
      stack: error.stack
    }, { status: 500 });
  }
}
