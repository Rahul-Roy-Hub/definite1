'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Clock, Database } from 'lucide-react';

interface ApiStatus {
  healthy: boolean;
  cached: boolean;
  lastRequestTime?: string;
  cacheStats?: {
    size: number;
    keys: string[];
  };
}

export function ApiStatusPanel() {
  const [status, setStatus] = useState<ApiStatus>({ healthy: true, cached: false });
  const [isChecking, setIsChecking] = useState(false);

  const checkApiStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/cache?action=stats');
      const data = await response.json();
      
      setStatus({
        healthy: response.ok,
        cached: data.stats.size > 0,
        lastRequestTime: data.timestamp,
        cacheStats: data.stats,
      });
    } catch (error) {
      setStatus({ healthy: false, cached: false });
    } finally {
      setIsChecking(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/cache?action=clear');
      if (response.ok) {
        await checkApiStatus();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>API Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Health Status</span>
          <Badge variant={status.healthy ? "default" : "destructive"}>
            {status.healthy ? 'Healthy' : 'Unhealthy'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Cache Status</span>
          <Badge variant={status.cached ? "secondary" : "outline"}>
            {status.cached ? `${status.cacheStats?.size || 0} items` : 'Empty'}
          </Badge>
        </div>
        
        {status.lastRequestTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Last Check</span>
            <span className="text-xs text-white">
              {new Date(status.lastRequestTime).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={checkApiStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="flex-1 glass-card border-white/10"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            Check
          </Button>
          
          <Button
            onClick={clearCache}
            variant="outline"
            size="sm"
            className="flex-1 glass-card border-white/10"
            disabled={!status.cached}
          >
            <Database className="h-3 w-3 mr-1" />
            Clear Cache
          </Button>
        </div>
        
        <div className="text-xs text-slate-500 mt-2">
          <Clock className="h-3 w-3 inline mr-1" />
          Cache TTL: 2 minutes | Rate limit: 10 req/sec
        </div>
      </CardContent>
    </Card>
  );
}
