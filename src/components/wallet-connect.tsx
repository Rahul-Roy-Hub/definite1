'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { ChainLogo } from '@/components/chain-logo';
import { type ChainId } from '@/lib/utils';
import Image from 'next/image';

export function WalletConnect() {
  // Helper function to map wagmi chain names to our chain IDs
  const getChainId = (chainName: string): ChainId | null => {
    const chainNameToId: Record<string, ChainId> = {
      'Ethereum': 'ethereum',
      'Polygon': 'polygon',
      'Optimism': 'optimism',
      'Arbitrum One': 'arbitrum',
      'Base': 'base',
    };
    
    return chainNameToId[chainName] || null;
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal}
                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    Wrong network
                  </Button>
                );
              }

              const customChainId = getChainId(chain.name || '');

              return (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {customChainId ? (
                      <ChainLogo chainId={customChainId} className="w-4 h-4 mr-2" />
                    ) : chain.hasIcon ? (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={12}
                            height={12}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    ) : null}
                    {chain.name}
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}