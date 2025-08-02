'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, DollarSign, RefreshCw } from 'lucide-react';
import { ChainSelector } from '@/components/chain-selector';
import { TokenBalance } from '@/components/token-balance';
import { ActivityFeed } from '@/components/activity-feed';
import { WalletInfo } from '@/components/wallet-info';
import { TestAddressInfo } from '@/components/test-address-info';
import { ApiStatusPanel } from '@/components/api-status-panel';
import { usePortfolioWithFallback } from '@/hooks/use-portfolio-with-fallback';
import { Button } from '@/components/ui/button';

export function Overview() {
  const { portfolio, isLoading, error, refetch, isUsingFallback, isUsingTestAddress } = usePortfolioWithFallback();

  const portfolioMetrics = [
    {
      title: 'Total Treasury Value',
      value: portfolio.totalValueFormatted,
      change: '+12.45%', // This would come from historical data comparison
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Chains',
      value: portfolio.chains.filter(chain => chain.value > 0).length.toString(),
      change: `${portfolio.chains.length} total`,
      trend: 'up' as const,
      icon: Wallet,
    },
    {
      title: 'Largest Position',
      value: portfolio.chains.length > 0 ? portfolio.chains[0].valueFormatted : '$0.00',
      change: portfolio.chains.length > 0 ? portfolio.chains[0].chainName : 'No data',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: 'Native Assets',
      value: portfolio.categories.find(cat => cat.categoryId === 'native')?.valueFormatted || '$0.00',
      change: 'vs Tokens',
      trend: 'up' as const,
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-8">
      <TestAddressInfo isVisible={isUsingTestAddress && !isUsingFallback} />
      
      <div className="flex justify-between items-center">
        <ChainSelector />
        <div className="flex items-center space-x-2">
          {isUsingFallback && (
            <span className="text-sm text-amber-400">Using mock data</span>
          )}
          {isUsingTestAddress && !isUsingFallback && (
            <span className="text-sm text-blue-400">Using test address (burn address)</span>
          )}
          {error && (
            <span className="text-sm text-red-400">Error: {error}</span>
          )}
          <Button
            onClick={refetch}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="glass-card border-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
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
          <ApiStatusPanel />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}