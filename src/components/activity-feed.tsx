'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Repeat, Calendar } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'swap',
    description: 'Swapped ETH for USDC',
    amount: '2.5 ETH → 7,118.08 USDC',
    time: '2 hours ago',
    status: 'completed',
    icon: Repeat,
  },
  {
    id: 2,
    type: 'receive',
    description: 'Received AAVE tokens',
    amount: '+247.83 AAVE',
    time: '5 hours ago',
    status: 'completed',
    icon: ArrowDownLeft,
  },
  {
    id: 3,
    type: 'schedule',
    description: 'DCA order executed',
    amount: '0.1 ETH → 284.72 USDC',
    time: '1 day ago',
    status: 'completed',
    icon: Calendar,
  },
  {
    id: 4,
    type: 'send',
    description: 'Sent USDC to treasury',
    amount: '-50,000 USDC',
    time: '2 days ago',
    status: 'completed',
    icon: ArrowUpRight,
  },
];

export function ActivityFeed() {
  return (
    <Card className="glass-card border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                    <Icon className="h-4 w-4 text-cyan-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{activity.description}</div>
                  <div className="text-sm text-slate-400 mt-1">{activity.amount}</div>
                  <div className="text-xs text-slate-500 mt-1">{activity.time}</div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  {activity.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}