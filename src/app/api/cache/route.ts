import { NextRequest, NextResponse } from 'next/server';
import { serverCache } from '@/lib/server-cache';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = serverCache.getStats();
        return NextResponse.json({
          success: true,
          stats,
          timestamp: new Date().toISOString(),
        });

      case 'clear':
        serverCache.clear();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Cache management endpoint',
          availableActions: ['stats', 'clear'],
          stats: serverCache.getStats(),
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json(
      { 
        error: 'Cache management failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
