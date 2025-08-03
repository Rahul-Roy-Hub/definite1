'use client';

import { useWallet } from '@/hooks/use-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { ChainLogo } from '@/components/chain-logo';
import { type ChainId } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function WalletInfo() {
  const { address, isConnected, chainId, balance } = useWallet();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to get chain name and id from chainId
  const getChainInfo = (chainId: number) => {
    const chains = { mainnet, polygon, optimism, arbitrum, base, sepolia };
    const chain = Object.values(chains).find(chain => chain.id === chainId);
    
    // Map wagmi chain names to our chain IDs
    const chainNameToId: Record<string, ChainId> = {
      'Ethereum': 'ethereum',
      'Polygon': 'polygon',
      'Optimism': 'optimism',
      'Arbitrum One': 'arbitrum',
      'Base': 'base',
    };
    
    const chainName = chain?.name || 'Unknown';
    const chainIdKey = chainNameToId[chainName] as ChainId;
    
    return { name: chainName, id: chainIdKey };
  };

  // Show loading state during SSR and initial client render
  if (!isMounted) {
    return (
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Loading wallet information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Please connect your wallet to view information</p>
        </CardContent>
      </Card>
    );
  }

  const chainInfo = getChainInfo(chainId);

  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Wallet Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-400">Address</p>
          <p className="text-white font-mono text-sm break-all">{address}</p>
        </div>
        
        <div>
          <p className="text-sm text-slate-400">Network</p>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 flex items-center space-x-1">
              <ChainLogo chainId={chainInfo.id} className="w-3 h-3" />
              <span>{chainInfo.name}</span>
            </Badge>
          </div>
        </div>
        
        {balance && (
          <div>
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-white">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 