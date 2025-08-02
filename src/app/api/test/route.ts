import { NextRequest, NextResponse } from 'next/server';
import { serverCache } from '@/lib/server-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const key = searchParams.get('key');
    const value = searchParams.get('value');

    switch (action) {
      case 'set':
        if (key && value) {
          serverCache.set(key, { test: value, timestamp: Date.now() });
          return NextResponse.json({
            success: true,
            message: `Set cache key: ${key}`,
            cacheSize: serverCache.getCacheSize(),
          });
        }
        break;

      case 'get':
        if (key) {
          const data = serverCache.get(key);
          return NextResponse.json({
            success: true,
            data,
            cacheSize: serverCache.getCacheSize(),
            cacheKeys: serverCache.getCacheKeys(),
          });
        }
        break;

      case 'clear':
        serverCache.clear();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared',
          cacheSize: serverCache.getCacheSize(),
        });

      default:
        return NextResponse.json({
          success: true,
          cacheSize: serverCache.getCacheSize(),
          cacheKeys: serverCache.getCacheKeys(),
          message: 'Cache test endpoint',
        });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    );
  }
}
