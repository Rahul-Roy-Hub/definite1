'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export function ChainSelector() {
  const { portfolio, isLoading, isUsingFallback, isUsingTestAddress } = usePortfolioWithFallback();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);

  // Create chain data from portfolio or fallback to mock data
  const chains = portfolio.chains.map(chain => ({
    id: chainIdToLogoId[chain.chainId] || 'ethereum',
    name: chain.chainName,
    tvl: chain.valueFormatted,
    chainId: chain.chainId,
    value: chain.value,
  }));

  // If no chains have value, show all supported chains with $0
  const displayChains = chains.length > 0 ? chains : Object.values(SUPPORTED_CHAINS).map(chainId => ({
    id: chainIdToLogoId[chainId] || 'ethereum',
    name: CHAIN_INFO[chainId]?.name || 'Unknown',
    tvl: '$0.00',
    chainId,
    value: 0,
  }));

  const handleChainClick = (chainId: number) => {
    setSelectedChain(selectedChain === chainId ? null : chainId);
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
          {isUsingFallback && (
            <Badge variant="outline" className="text-amber-400 border-amber-400/50">
              Mock Data
            </Badge>
          )}
          {isUsingTestAddress && !isUsingFallback && (
            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
              Test Address
            </Badge>
          )}
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
                        {((selected.value / portfolio.totalValue) * 100).toFixed(2)}% of portfolio
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