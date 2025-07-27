'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Network, Clock, DollarSign } from 'lucide-react';
import { ChainLogo } from '@/components/chain-logo';
import { type ChainId } from '@/lib/utils';

export function CrossChain() {
  const [amount, setAmount] = useState('');
  const [sourceChain, setSourceChain] = useState<ChainId>('ethereum');
  const [targetChain, setTargetChain] = useState<ChainId>('polygon');
  const [selectedToken, setSelectedToken] = useState('USDC');

  const chains: Array<{ id: ChainId; name: string }> = [
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'arbitrum', name: 'Arbitrum' },
    { id: 'optimism', name: 'Optimism' },
    { id: 'base', name: 'Base' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Cross-Chain Transfer</h2>
        <p className="text-slate-400">Transfer tokens seamlessly across different chains using 1inch Fusion+</p>
      </div>

      <Card className="glass-card border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2 text-cyan-400" />
            Bridge Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">From Chain</label>
              <Select value={sourceChain} onValueChange={(value) => setSourceChain(value as ChainId)}>
                <SelectTrigger className="glass-card border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center">
                        <ChainLogo chainId={chain.id} className="w-4 h-4 mr-2" />
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">To Chain</label>
              <Select value={targetChain} onValueChange={(value) => setTargetChain(value as ChainId)}>
                <SelectTrigger className="glass-card border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center">
                        <ChainLogo chainId={chain.id} className="w-4 h-4 mr-2" />
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Token & Amount</label>
            <div className="glass-card p-4 border-white/10">
              <div className="flex items-center space-x-4">
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="w-32 border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                    <SelectItem value="WETH">WETH</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 bg-transparent text-xl font-semibold text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-slate-400">≈ $1,247.82</span>
                <span className="text-slate-400">Balance: 5,247.82 USDC</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 border-white/10 space-y-3">
            <h3 className="font-semibold text-white mb-3">Transfer Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Estimated Time
              </span>
              <span className="text-white">2-5 minutes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Bridge Fee
              </span>
              <span className="text-white">$8.45</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Gas Fee</span>
              <span className="text-white">~$15.23</span>
            </div>
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">You&apos;ll Receive</span>
                <span className="text-green-400">1,223.32 USDC</span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white h-12 text-lg font-semibold">
            <ArrowRight className="h-5 w-5 mr-2" />
            Start Transfer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}