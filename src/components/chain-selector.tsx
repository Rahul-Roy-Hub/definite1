'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChainLogo } from '@/components/chain-logo';
import { usePortfolioWithFallback } from '@/hooks/use-portfolio-with-fallback';
import { CHAIN_INFO, SUPPORTED_CHAINS } from '@/lib/types';
import { type ChainId } from '@/lib/utils';

// Mapping from chain IDs to ChainId type for logos
const chainIdToLogoId: Record<number, ChainId> = {
  [SUPPORTED_CHAINS.ETHEREUM]: 'ethereum',
  [SUPPORTED_CHAINS.POLYGON]: 'polygon',
  [SUPPORTED_CHAINS.ARBITRUM]: 'arbitrum',
  [SUPPORTED_CHAINS.OPTIMISM]: 'optimism',
  [SUPPORTED_CHAINS.BASE]: 'base',
};

interface ChainSelectorProps {
  onChainChange?: (chainId: number) => void;
}

// Skeleton for chain buttons
function ChainButtonSkeleton() {
  return (
    <div className="flex items-center space-x-2 h-auto p-3 border border-white/20 rounded-lg">
      <Skeleton className="w-5 h-5 rounded" />
      <div className="text-left space-y-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-5 w-8 rounded ml-2" />
    </div>
  );
}

// Loading skeleton for chain selector
function ChainSelectorSkeleton() {
  return (
    <div className="glass-card p-6 border-white/10 bg-white/5">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded" />
      </div>
      
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ChainButtonSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChainSelector({ onChainChange }: ChainSelectorProps = {}) {
  const { portfolio, isLoading, isUsingFallback, isUsingTestAddress } = usePortfolioWithFallback();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);

  if (isLoading) {
    return <ChainSelectorSkeleton />;
  }

  // Create a map of chains with data from portfolio
  const portfolioChainsMap = new Map(
    portfolio.chains.map(chain => [chain.chainId, chain])
  );

  // Always show all supported chains, with $0 for chains without data
  const displayChains = Object.values(SUPPORTED_CHAINS).map(chainId => {
    const portfolioChain = portfolioChainsMap.get(chainId);
    return {
      id: chainIdToLogoId[chainId] || 'ethereum',
      name: CHAIN_INFO[chainId]?.name || 'Unknown',
      tvl: portfolioChain?.valueFormatted || '$0.00',
      chainId,
      value: portfolioChain?.value || 0,
    };
  });

  const handleChainClick = (chainId: number) => {
    setSelectedChain(selectedChain === chainId ? null : chainId);
    if (onChainChange) {
      onChainChange(chainId);
    }
  };

  return (
    <div className="glass-card p-6 border-white/10 bg-white/5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Chain Distribution</h3>
          <p className="text-sm text-slate-400">
            Total Portfolio: {portfolio.totalValueFormatted}
          </p>
        </div>
        <div className="flex items-center space-x-2">
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {displayChains
              .sort((a, b) => b.value - a.value) // Sort by value descending
              .map((chain) => (
                <Button
                  key={chain.chainId}
                  variant={selectedChain === chain.chainId ? "default" : "outline"}
                  onClick={() => handleChainClick(chain.chainId)}
                  className={`flex items-center space-x-2 h-auto p-3 border-white/20 hover:bg-white/10 transition-all ${
                    chain.value === 0 ? 'opacity-50' : ''
                  } ${selectedChain === chain.chainId ? 'bg-white/20 border-white/40' : ''}`}
                >
                  <ChainLogo chainId={chain.id} className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-white font-medium">{chain.name}</div>
                    <div className="text-xs text-slate-400">{chain.tvl}</div>
                  </div>
                  {chain.value > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {((chain.value / portfolio.totalValue) * 100).toFixed(1)}%
                    </Badge>
                  )}
                </Button>
              ))}
          </div>
          
          {selectedChain && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              {(() => {
                const selected = displayChains.find(c => c.chainId === selectedChain);
                return selected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ChainLogo chainId={selected.id} className="w-8 h-8" />
                      <div>
                        <h4 className="text-white font-semibold">{selected.name}</h4>
                        <p className="text-sm text-slate-400">Chain ID: {selected.chainId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">{selected.tvl}</div>
                      <div className="text-slate-400 text-sm">
                        {selected.value > 0 
                          ? `${((selected.value / portfolio.totalValue) * 100).toFixed(2)}% of portfolio`
                          : 'No holdings'
                        }
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}