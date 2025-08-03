"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Network, Clock, DollarSign, RefreshCw, AlertCircle, ArrowUpDown } from 'lucide-react'
import { ChainLogo } from '@/components/chain-logo'
import { type ChainId } from '@/lib/utils'

interface QuoteData {
  srcTokenAmount: string;
  dstTokenAmount: string;
  srcTokenAmountFormatted: string;
  dstTokenAmountFormatted: string;
  estimatedFeeUsd: string;
  priceImpact: number;
  recommendedPreset: string;
  exchangeRate?: string;
  presets: {
    fast: {
      auctionDuration: number;
      gasCost: {
        gasBumpEstimate: number;
        gasPriceEstimate: string;
      };
    };
    medium: {
      auctionDuration: number;
      gasCost: {
        gasBumpEstimate: number;
        gasPriceEstimate: string;
      };
    };
    slow: {
      auctionDuration: number;
      gasCost: {
        gasBumpEstimate: number;
        gasPriceEstimate: string;
      };
    };
  };
  prices?: {
    usd: {
      srcToken: string;
      dstToken: string;
    };
  };
  volume?: {
    usd: {
      srcToken: string;
      dstToken: string;
    };
  };
}

export function CrossChain() {
  const [amount, setAmount] = useState('');
  const [sourceChain, setSourceChain] = useState<ChainId>('ethereum');
  const [targetChain, setTargetChain] = useState<ChainId>('polygon');
  const [sourceToken, setSourceToken] = useState('USDC');
  const [targetToken, setTargetToken] = useState('USDC');
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'fast' | 'medium' | 'slow'>('fast');

  const chains: Array<{ id: ChainId; name: string }> = [
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'arbitrum', name: 'Arbitrum' },
    { id: 'optimism', name: 'Optimism' },
    { id: 'base', name: 'Base' },
  ];

  const tokens = ['USDC', 'USDT', 'DAI', 'WETH', 'ETH'];

  const getAvailableTokens = (chainId: ChainId): string[] => {
    const chainTokens = ['USDC', 'USDT', 'DAI', 'WETH'];
    if (chainId === 'ethereum') {
      return [...chainTokens, 'ETH'];
    }
    return chainTokens;
  };

  const fetchQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoadingQuote(true);
    setQuoteError(null);

    try {
      const params = new URLSearchParams({
        srcChain: sourceChain,
        dstChain: targetChain,
        srcToken: sourceToken,
        dstToken: targetToken,
        amount: amount,
      });

      const response = await fetch(`/api/cross-chain-swap-quote?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quote');
      }

      const quoteData: QuoteData = await response.json();
      setQuote(quoteData);
    } catch (error) {
      console.error('Quote fetch error:', error);
      setQuoteError(error instanceof Error ? error.message : 'Failed to fetch quote');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (amount && parseFloat(amount) > 0 && (sourceChain !== targetChain || sourceToken !== targetToken)) {
        fetchQuote();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, sourceChain, targetChain, sourceToken, targetToken]);

  useEffect(() => {
    const sourceTokens = getAvailableTokens(sourceChain);
    const targetTokens = getAvailableTokens(targetChain);

    if (!sourceTokens.includes(sourceToken)) {
      setSourceToken('USDC');
    }
    if (!targetTokens.includes(targetToken)) {
      setTargetToken('USDC');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, targetChain]);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const calculateGasFeeUsd = (preset: any): string => {
    if (!quote?.prices?.usd?.srcToken || !preset?.gasCost) return '~$15.23';
    const gasInToken = preset.gasCost.gasBumpEstimate / Math.pow(10, 18);
    const gasInUsd = gasInToken * parseFloat(quote.prices.usd.srcToken);
    return `~$${gasInUsd.toFixed(2)}`;
  };

  const getEstimatedTime = (): string => {
    if (!quote?.presets) return '2-5 minutes';
    const preset = quote.presets[selectedPreset];
    return formatDuration(preset.auctionDuration);
  };

  const getReceiveAmount = (): string => {
    if (!quote) return '0.00';
    return quote.dstTokenAmountFormatted;
  };

  const getBridgeFee = (): string => {
    if (!quote) return '$8.45';
    return `$${quote.estimatedFeeUsd}`;
  };

  const swapTokens = () => {
    const tempChain = sourceChain;
    setSourceChain(targetChain);
    setTargetChain(tempChain);

    const tempToken = sourceToken;
    setSourceToken(targetToken);
    setTargetToken(tempToken);
  };

  const createSwapOrder = () => {
    if (!quote || !amount) return;

    const newOrder = {
      id: Date.now().toString(),
      pair: `${sourceToken} → ${targetToken}`,
      sourceChain: chains.find(c => c.id === sourceChain)?.name || sourceChain,
      targetChain: chains.find(c => c.id === targetChain)?.name || targetChain,
      sourceToken,
      targetToken,
      amount: `${amount} ${sourceToken}`,
      receiveAmount: `${getReceiveAmount()} ${targetToken}`,
      bridgeFee: getBridgeFee(),
      gasFee: calculateGasFeeUsd(quote.presets[selectedPreset]),
      priceImpact: quote.priceImpact,
      exchangeRate: quote.exchangeRate || '0',
      speed: selectedPreset,
      estimatedTime: getEstimatedTime(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      quoteData: quote
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existingOrders = JSON.parse(localStorage.getItem('swapOrders') || '[]');
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem('swapOrders', JSON.stringify(updatedOrders));

        setAmount('');
        setQuote(null);

        alert(`Order created successfully!\n${sourceToken} → ${targetToken}\nAmount: ${amount} ${sourceToken}`);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-white mb-2'>Cross-Chain Swap</h2>
        <p className='text-slate-400'>Swap tokens seamlessly across different chains using 1inch Fusion+</p>
      </div>

      <Card className='glass-card border-white/10 bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center'>
              <Network className='h-5 w-5 mr-2 text-cyan-400' />
              Swap Configuration
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={swapTokens}
              className='text-cyan-400 hover:text-cyan-300'
              title='Swap tokens and chains'
            >
              <ArrowUpDown className='h-4 w-4' />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm text-slate-400'>From</label>
              <div className='grid grid-cols-2 gap-2'>
                <Select value={sourceChain} onValueChange={(value) => setSourceChain(value as ChainId)}>
                  <SelectTrigger className='glass-card border-white/10 bg-white/5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-slate-900 border-white/10'>
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className='flex items-center'>
                          <ChainLogo chainId={chain.id} className='w-4 h-4 mr-2' />
                          {chain.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sourceToken} onValueChange={setSourceToken}>
                  <SelectTrigger className='glass-card border-white/10 bg-white/5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-slate-900 border-white/10'>
                    {getAvailableTokens(sourceChain).map((token) => (
                      <SelectItem key={token} value={token}>{token}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm text-slate-400'>To</label>
              <div className='grid grid-cols-2 gap-2'>
                <Select value={targetChain} onValueChange={(value) => setTargetChain(value as ChainId)}>
                  <SelectTrigger className='glass-card border-white/10 bg-white/5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-slate-900 border-white/10'>
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className='flex items-center'>
                          <ChainLogo chainId={chain.id} className='w-4 h-4 mr-2' />
                          {chain.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={targetToken} onValueChange={setTargetToken}>
                  <SelectTrigger className='glass-card border-white/10 bg-white/5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-slate-900 border-white/10'>
                    {getAvailableTokens(targetChain).map((token) => (
                      <SelectItem key={token} value={token}>{token}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-slate-400'>Amount</label>
            <div className='glass-card p-4 border-white/10'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-slate-400'>You pay</span>
                <span className='text-sm text-slate-400'>Balance: 5,247.82 {sourceToken}</span>
              </div>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2 text-white font-semibold'>
                  <span className='text-lg'>{sourceToken}</span>
                </div>
                <Input
                  placeholder='0.0'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className='border-0 bg-transparent text-xl font-semibold text-white placeholder:text-slate-500 focus-visible:ring-0 text-right'
                />
                {isLoadingQuote && (
                  <RefreshCw className='h-4 w-4 text-cyan-400 animate-spin' />
                )}
              </div>
              <div className='flex justify-end mt-2 text-sm'>
                <span className='text-slate-400'>
                  {quote?.prices?.usd?.srcToken ?
                    `≈ $${(parseFloat(amount || '0') * parseFloat(quote.prices.usd.srcToken)).toFixed(2)}` :
                    '≈ $0.00'
                  }
                </span>
              </div>
            </div>

            <div className='glass-card p-4 border-white/10 mt-2'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-slate-400'>You receive</span>
                <span className='text-sm text-slate-400'>On {chains.find(c => c.id === targetChain)?.name}</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2 text-white font-semibold'>
                  <span className='text-lg'>{targetToken}</span>
                </div>
                <div className='text-xl font-semibold text-green-400'>
                  {getReceiveAmount()}
                </div>
              </div>
              <div className='flex justify-end mt-2 text-sm'>
                <span className='text-slate-400'>
                  {quote?.prices?.usd?.dstToken ?
                    `≈ $${(parseFloat(getReceiveAmount()) * parseFloat(quote.prices.usd.dstToken)).toFixed(2)}` :
                    '≈ $0.00'
                  }
                </span>
              </div>
            </div>
          </div>

          {quote && (
            <div className='space-y-2'>
              <label className='text-sm text-slate-400'>Transfer Speed</label>
              <div className='grid grid-cols-3 gap-2'>
                {Object.entries(quote.presets).map(([preset, data]) => (
                  <button
                    key={preset}
                    onClick={() => setSelectedPreset(preset as 'fast' | 'medium' | 'slow')}
                    className={`p-3 rounded-lg border text-sm transition-all ${selectedPreset === preset
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    <div className='font-semibold capitalize'>{preset}</div>
                    <div className='text-xs mt-1'>{formatDuration(data.auctionDuration)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {quoteError && (
            <div className='glass-card p-4 border-red-500/20 bg-red-500/5'>
              <div className='flex items-center text-red-400'>
                <AlertCircle className='h-4 w-4 mr-2' />
                <span className='text-sm'>{quoteError}</span>
              </div>
            </div>
          )}

          {/* Transfer Summary */}
          <div className='glass-card p-4 border-white/10 space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-white'>Transfer Summary</h3>
              {quote && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={fetchQuote}
                  disabled={isLoadingQuote}
                  className='text-cyan-400 hover:text-cyan-300'
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingQuote ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>

            <div className='flex justify-between text-sm'>
              <span className='text-slate-400 flex items-center'>
                <Clock className='h-4 w-4 mr-1' />
                Estimated Time
              </span>
              <span className='text-white'>{getEstimatedTime()}</span>
            </div>

            <div className='flex justify-between text-sm'>
              <span className='text-slate-400 flex items-center'>
                <DollarSign className='h-4 w-4 mr-1' />
                Bridge Fee
              </span>
              <span className='text-white'>{getBridgeFee()}</span>
            </div>

            <div className='flex justify-between text-sm'>
              <span className='text-slate-400'>Gas Fee</span>
              <span className='text-white'>
                {quote ? calculateGasFeeUsd(quote.presets[selectedPreset]) : '~$15.23'}
              </span>
            </div>

            {quote && quote.priceImpact > 0 && (
              <div className='flex justify-between text-sm'>
                <span className='text-slate-400'>Price Impact</span>
                <span className={`${quote.priceImpact > 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
            )}

            <div className='border-t border-white/10 pt-2'>
              <div className='flex justify-between font-semibold'>
                <span className='text-white'>You&apos;ll Receive</span>
                <span className='text-green-400'>{getReceiveAmount()} {targetToken}</span>
              </div>
              {sourceToken !== targetToken && (
                <div className='text-xs text-slate-400 mt-1'>
                  Swapping {sourceToken} → {targetToken} across chains
                </div>
              )}
            </div>
          </div>

          <Button
            className='w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white h-12 text-lg font-semibold disabled:opacity-50'
            disabled={!quote || isLoadingQuote || (sourceChain === targetChain && sourceToken === targetToken) || !amount || parseFloat(amount) <= 0}
            onClick={createSwapOrder}
          >
            <ArrowRight className='h-5 w-5 mr-2' />
            {isLoadingQuote ? 'Getting Quote...' :
              sourceToken === targetToken ? 'Create Transfer Order' : `Create Swap Order`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
