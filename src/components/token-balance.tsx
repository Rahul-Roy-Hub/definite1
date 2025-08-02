'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenBalance } from '@/hooks/use-token-balance';
import { useState } from 'react';
import Image from 'next/image';

// Skeleton component for token cards
function TokenCardSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 glass-card border-white/10 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
      
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

// Loading skeleton component
function TokenBalanceSkeleton() {
  return (
    <Card className="glass-card border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Holdings</CardTitle>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
            {/* Generate 5 skeleton token cards */}
            {Array.from({ length: 5 }).map((_, index) => (
              <TokenCardSkeleton key={index} />
            ))}
          </div>
          
          <div className="pt-4 border-t border-white/10 bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TokenBalance() {
  const { balanceData, isLoading, error, refetch, isUsingTestAddress } = useTokenBalance(1); // Default to Ethereum

  if (isLoading) {
    return <TokenBalanceSkeleton />;
  }

  if (error) {
    return (
      <Card className="glass-card border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Token Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <span className="ml-2 text-red-400">Error: {error}</span>
            <Button onClick={refetch} variant="outline" size="sm" className="ml-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tokens = balanceData?.tokens || [];

  return (
    <Card className="glass-card border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Holdings</CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={refetch} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No tokens found on this chain
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
              {tokens.map((token) => (
                                        <div key={`${token.address}-${token.chainId}`} className="grid grid-cols-3 gap-4 p-4 glass-card border-white/10 rounded-lg">
                  <div className="flex items-center space-x-4">
                                    {token.logoURI ? (
                  <Image
                    src={token.logoURI}
                    alt={token.symbol || 'Token'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{(token.symbol || 'T').slice(0, 2)}</span>
                  </div>
                )}
                    <div>
                                              <div className="font-semibold text-white">{token.symbol || 'Unknown'}</div>
                        <div className="text-sm text-slate-400">{token.name || 'Unknown Token'}</div>
                        {token.chainName && (
                          <div className="text-xs text-blue-400">
                            {token.chainName}
                          </div>
                        )}
                        {token.tags && token.tags.length > 0 && (
                          <div className="text-xs text-slate-500">
                            {token.tags.slice(0, 2).join(', ')}
                            {token.tags.length > 2 && '...'}
                          </div>
                        )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-white">{token.balanceFormatted}</div>
                    <div className="text-sm text-slate-400">
                      {token.price > 0 ? `$${token.price.toFixed(6)}` : 'N/A'}
                    </div>
                    {token.priceChange24h !== undefined && token.priceChange24h !== 0 && (
                      <div className={`text-xs ${token.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}% (24h)
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-white">{token.valueFormatted}</div>
                                                <div className="text-sm text-slate-400">
                              {token.value > 0 && balanceData && balanceData.totalValue > 0 ? 
                                `${((token.value / balanceData.totalValue) * 100).toFixed(2)}%` : 
                                '0%'
                              }
                            </div>
                  </div>
                </div>
              ))}
            </div>
            
            {balanceData && balanceData.totalValue > 0 && (
              <div className="pt-4 border-t border-white/10 bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Value</span>
                  <span className="font-semibold text-white">{balanceData.totalValueFormatted}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}