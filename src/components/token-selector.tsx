"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check } from 'lucide-react'
import Image, { StaticImageData } from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface TokenData {
  label: string;
  value: string;
  img: StaticImageData;
  address: string;
  chain_id: number;
  decimals: number;
  chain: string;
  token_type: string;
}

interface TokenSelectorProps {
  selectedToken: string;
  onTokenChange: (token: string) => void;
  supportedTokens: TokenData[];
}

export function TokenSelector({
  selectedToken,
  onTokenChange,
  supportedTokens,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTokenData = supportedTokens.find(
    (token) => token.label === selectedToken
  );

  const handleTokenSelect = (tokenLabel: string) => {
    onTokenChange(tokenLabel);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='flex items-center space-x-2 bg-slate-800 border-white/20 hover:bg-slate-700'
        >
          {selectedTokenData ? (
            <>
              <div className='w-6 h-6 rounded-full overflow-hidden z-10'>
                <Image
                  src={selectedTokenData.img}
                  alt={selectedTokenData.label}
                  width={24}
                  height={24}
                  className='w-full h-full object-cover'
                />
              </div>
              <span className='text-white'>{selectedToken}</span>
            </>
          ) : (
            <>
              <div className='w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-xs'>
                  {selectedToken.slice(0, 2)}
                </span>
              </div>
              <span className='text-white'>{selectedToken}</span>
            </>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className='p-0 sm:max-w-[425px] bg-slate-800 border-white/20 text-white rounded-lg overflow-hidden'>
        <DialogHeader className='p-4 border-b border-white/10'>
          <DialogTitle className='text-lg font-medium'>
            Select a token
          </DialogTitle>
          <DialogDescription className='text-slate-400 text-sm'>
            Choose the token you want to use.
          </DialogDescription>
        </DialogHeader>
        <div className='p-2 max-h-[300px] overflow-y-auto'>
          {supportedTokens.map((token) => (
            <button
              key={token.label}
              onClick={() => handleTokenSelect(token.label)}
              className='w-full flex items-center justify-between p-3 hover:bg-slate-700 rounded-lg transition-colors'
            >
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 rounded-full overflow-hidden'>
                  <Image
                    src={token.img}
                    alt={token.label}
                    width={32}
                    height={32}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='text-left'>
                  <div className='text-white font-medium'>{token.label}</div>
                  <div className='text-slate-400 text-sm'>{token.value}</div>
                </div>
              </div>
              {selectedToken === token.label && (
                <Check className='h-4 w-4 text-cyan-400' />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
