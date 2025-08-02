'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';

export function Simulation() {
  const [txData, setTxData] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = () => {
    // Mock simulation result
    setSimulationResult({
      // @ts-expect-error
      status: 'success',
      gasUsed: '142,456',
      gasPrice: '28 gwei',
      slippage: '0.23%',
      priceImpact: '0.15%',
      securityScore: 85,
      warnings: [
        'High gas usage detected',
        'Contract not verified on Etherscan'
      ],
      risks: [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Transaction Simulation</h2>
        <p className="text-slate-400">Simulate transactions and analyze security risks before execution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-cyan-400" />
              Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Transaction Data</label>
              <Textarea
                placeholder="Paste transaction data or function call..."
                value={txData}
                onChange={(e) => setTxData(e.target.value)}
                className="glass-card border-white/10 bg-white/5 min-h-[120px] text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Contract Address (Optional)</label>
              <Input
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="glass-card border-white/10 bg-white/5 text-white"
              />
            </div>

            <Button
              onClick={handleSimulate}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              <Shield className="h-4 w-4 mr-2" />
              Simulate Transaction
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-400" />
              Simulation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Gas Used</span>
                    <div className="text-white font-medium">142,456</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Gas Price</span>
                    <div className="text-white font-medium">28 gwei</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Slippage</span>
                    <div className="text-green-400 font-medium">0.23%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Price Impact</span>
                    <div className="text-green-400 font-medium">0.15%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400">Security Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full"
                        style={{ width: '85%' }}
                      />
                    </div>
                    <span className="text-white font-bold">85/100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400">Warnings</span>
                  <div className="space-y-1">
                    <div className="flex items-center text-yellow-400 text-sm">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      High gas usage detected
                    </div>
                    <div className="flex items-center text-yellow-400 text-sm">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      Contract not verified on Etherscan
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">Run a simulation to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
