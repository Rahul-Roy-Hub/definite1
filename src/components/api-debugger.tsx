'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ApiDebuggerProps {
  className?: string;
}

interface CacheStatus {
  size: number;
  keys: string[];
}

export function ApiDebugger({ className }: ApiDebuggerProps) {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const checkCacheStatus = async () => {
    try {
      const response = await fetch('/api/cache');
      if (response.ok) {
        const data = await response.json();
        // Handle both direct stats and nested stats structure
        const stats = data.stats || data;
        if (stats && typeof stats.size === 'number' && Array.isArray(stats.keys)) {
          setCacheStatus(stats);
        } else {
          console.warn('Unexpected cache status format:', data);
          setCacheStatus(null);
        }
      }
    } catch (error) {
      console.error('Failed to check cache status:', error);
      setCacheStatus(null);
    }
  };

  const clearCache = async () => {
    setIsClearingCache(true);
    try {
      const response = await fetch('/api/cache', { method: 'DELETE' });
      if (response.ok) {
        setLastRefresh(new Date());
        await checkCacheStatus();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  useEffect(() => {
    checkCacheStatus();
  }, []);

  return (
    <Card className={`bg-black/20 border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>API Debugger</span>
          <div className="flex items-center space-x-2">
            <Button
              onClick={checkCacheStatus}
              variant="outline"
              size="sm"
              className="glass-card border-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Cache
            </Button>
            <Button
              onClick={clearCache}
              disabled={isClearingCache}
              variant="outline"
              size="sm"
              className="glass-card border-white/10 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Cache Status:</span>
            {cacheStatus ? (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unavailable
              </Badge>
            )}
          </div>
          
          {cacheStatus && (
            <div className="text-xs text-slate-400">
              <div>Cache entries: {cacheStatus.size}</div>
              {cacheStatus.keys && cacheStatus.keys.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-slate-300 mb-1">Cached keys:</div>
                  <div className="space-y-1">
                    {cacheStatus.keys.slice(0, 3).map((key, index) => (
                      <div key={index} className="text-xs font-mono bg-white/5 p-1 rounded">
                        {key}
                      </div>
                    ))}
                    {cacheStatus.keys.length > 3 && (
                      <div className="text-xs text-slate-500">
                        ... and {cacheStatus.keys.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {lastRefresh && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Last cleared: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        )}

        <div className="text-xs text-slate-500 space-y-1">
          <div>• Rate limiting: 1 second between requests</div>
          <div>• Retry attempts: 3 with 2 second delays</div>
          <div>• Cache TTL: 5 minutes</div>
        </div>
      </CardContent>
    </Card>
  );
}
