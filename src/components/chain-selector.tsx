'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChainLogo } from '@/components/chain-logo';
import { type ChainId } from '@/lib/utils';

const chains: Array<{ id: ChainId; name: string; tvl: string }> = [
  { id: 'ethereum', name: 'Ethereum', tvl: '$1.2M' },
  { id: 'polygon', name: 'Polygon', tvl: '$847K' },
  { id: 'arbitrum', name: 'Arbitrum', tvl: '$623K' },
  { id: 'optimism', name: 'Optimism', tvl: '$245K' },
  { id: 'base', name: 'Base', tvl: '$156K' },
];

export function ChainSelector() {
  return (
    <div className="glass-card p-6 border-white/10 bg-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Chain Distribution</h3>
      <div className="flex flex-wrap gap-3">
        {chains.map((chain) => (
          <Button
            key={chain.id}
            variant="outline"
            className="flex items-center space-x-2 h-auto p-3 border-white/20 hover:bg-white/10"
          >
            <ChainLogo chainId={chain.id} className="w-5 h-5" />
            <div className="text-left">
              <div className="text-white font-medium">{chain.name}</div>
              <div className="text-xs text-slate-400">{chain.tvl}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}