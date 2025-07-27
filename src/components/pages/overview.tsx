'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { ChainSelector } from '@/components/chain-selector';
import { TokenBalance } from '@/components/token-balance';
import { ActivityFeed } from '@/components/activity-feed';
import { WalletInfo } from '@/components/wallet-info';

export function Overview() {
  const portfolioMetrics = [
    {
      title: 'Total Treasury Value',
      value: '$2,847,293.42',
      change: '+12.45%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Positions',
      value: '24',
      change: '+3',
      trend: 'up' as const,
      icon: Wallet,
    },
    {
      title: '24h P&L',
      value: '+$38,492.17',
      change: '+1.35%',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: 'Monthly Yield',
      value: '14.23%',
      change: '-2.1%',
      trend: 'down' as const,
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-8">
      <ChainSelector />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portfolioMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="glass-card border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className={`text-xs flex items-center mt-1 ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TokenBalance />
        </div>
        <div className="space-y-8">
          <WalletInfo />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}