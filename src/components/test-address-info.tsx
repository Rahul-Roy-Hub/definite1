'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TEST_ADDRESS = '0x000000000000000000000000000000000000dead';

// Helper functions
function formatTestAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getTestAddressDescription(address: string): string {
  return "This is the burn address where tokens are permanently removed from circulation.";
}

interface TestAddressInfoProps {
  isVisible: boolean;
}

export function TestAddressInfo({ isVisible }: TestAddressInfoProps) {
  if (!isVisible) return null;

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${TEST_ADDRESS}`, '_blank');
  };

  return (
    <Card className="glass-card border-blue-400/20 bg-blue-400/5">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                Demo Mode
              </Badge>
              <span className="text-sm font-medium text-white">Using Test Address</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Since you don&apos;t have a wallet connected or mainnet balance, we&apos;re using the burn address 
              <code className="mx-1 px-1 py-0.5 bg-black/20 rounded text-xs font-mono">
                {formatTestAddress(TEST_ADDRESS)}
              </code>
              to demonstrate real 1inch API data. {getTestAddressDescription(TEST_ADDRESS)}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                onClick={openEtherscan}
                variant="outline"
                size="sm"
                className="glass-card border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Etherscan
              </Button>
              <span className="text-xs text-slate-400">
                Connect your wallet to see your real portfolio
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
