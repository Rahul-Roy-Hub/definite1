'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Pause, Play, Trash2 } from 'lucide-react';

export function Schedules() {
  const scheduledSwaps = [
    {
      id: 1,
      pair: 'ETH → USDC',
      frequency: 'Daily',
      amount: '0.1 ETH',
      nextExecution: '2024-01-15 14:00',
      status: 'active',
      totalExecutions: 12,
    },
    {
      id: 2,
      pair: 'USDC → BTC',
      frequency: 'Weekly',
      amount: '$1,000',
      nextExecution: '2024-01-17 09:00',
      status: 'paused',
      totalExecutions: 4,
    },
    {
      id: 3,
      pair: 'DAI → ETH',
      frequency: 'Monthly',
      amount: '$5,000',
      nextExecution: '2024-02-01 12:00',
      status: 'active',
      totalExecutions: 2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Scheduled Swaps</h2>
          <p className="text-slate-400">Automate your DCA and rebalancing strategies</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scheduledSwaps.map((swap) => (
          <Card key={swap.id} className="glass-card border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{swap.pair}</CardTitle>
                <Badge 
                  variant={swap.status === 'active' ? 'default' : 'secondary'}
                  className={swap.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                >
                  {swap.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Frequency</span>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-cyan-400" />
                    <span className="text-white">{swap.frequency}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Amount</span>
                  <div className="text-white mt-1">{swap.amount}</div>
                </div>
                <div>
                  <span className="text-slate-400">Next Execution</span>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1 text-purple-400" />
                    <span className="text-white text-xs">{swap.nextExecution}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Executions</span>
                  <div className="text-white mt-1">{swap.totalExecutions}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex space-x-2">
                  {swap.status === 'active' ? (
                    <Button variant="outline" size="sm" className="border-white/20">
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="border-white/20">
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-cyan-400">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}