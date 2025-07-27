'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, Settings, Zap, Shield } from 'lucide-react';
import { TokenSelector } from '@/components/token-selector';

export function Swaps() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="glass-card border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Swap Tokens</span>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">From</label>
            <div className="glass-card p-4 border-white/10">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-semibold text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
                <TokenSelector 
                  selectedToken={fromToken}
                  onTokenChange={setFromToken}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-slate-400">$2,847.23</span>
                <span className="text-sm text-slate-400">Balance: 1.2486 ETH</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">To</label>
            <div className="glass-card p-4 border-white/10">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="0.0"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-semibold text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
                <TokenSelector 
                  selectedToken={toToken}
                  onTokenChange={setToToken}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-slate-400">$2,838.91</span>
                <span className="text-sm text-slate-400">Balance: 5,247.82 USDC</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Rate</span>
              <span className="text-white">1 ETH = 2,847.23 USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Price Impact</span>
              <span className="text-green-400">0.12%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Network Fee</span>
              <span className="text-white">~$12.45</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Route</span>
              <span className="text-cyan-400">1inch Fusion</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-cyan-100">MEV Protection Enabled</span>
          </div>

          <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white h-12 text-lg font-semibold animate-glow">
            <Zap className="h-5 w-5 mr-2" />
            Swap Tokens
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}