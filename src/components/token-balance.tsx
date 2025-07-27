'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const tokens = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '42.8491',
    value: '$121,847.23',
    change: '+5.42%',
    trend: 'up',
    price: '$2,847.23',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '847,293.42',
    value: '$847,293.42',
    change: '+0.01%',
    trend: 'up',
    price: '$1.00',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    balance: '5.2847',
    value: '$234,592.18',
    change: '-2.34%',
    trend: 'down',
    price: '$44,382.94',
  },
  {
    symbol: 'AAVE',
    name: 'Aave',
    balance: '1,247.83',
    value: '$98,472.91',
    change: '+12.87%',
    trend: 'up',
    price: '$78.92',
  },
];

export function TokenBalance() {
  return (
    <Card className="glass-card border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Token Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokens.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{token.symbol}</div>
                  <div className="text-sm text-slate-400">{token.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-white">{token.balance}</div>
                <div className="text-sm text-slate-400">{token.price}</div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-white">{token.value}</div>
                <div className={`text-sm flex items-center ${
                  token.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}