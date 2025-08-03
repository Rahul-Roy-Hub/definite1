"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDown, Settings, Zap, Shield, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { TokenSelector } from '@/components/token-selector'
import { useWallet } from '@/hooks/use-wallet'
import { StaticImageData } from 'next/image'
import ETHImg from '@/assets/tokens/eth.svg'
import USDCImg from '@/assets/tokens/usdc.svg'
import EURCImg from '@/assets/tokens/eurc.png'
import { formatUnits } from 'viem'

interface TokenPrice {
  amount: string;
  currency: string;
}

interface TokenData {
  label: string;
  value: string;
  img: StaticImageData;
  address: string;
  chain_id: number;
  decimals: number;
  chain: string;
  token_type: string;
  price?: TokenPrice;
}

interface QuoteData {
  dstAmount: string;
  gas?: string;
  gasPrice?: string;
}

interface SwapData {
  error: any;
  dstAmount: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
}

interface TransactionStatus {
  hash?: string;
  status: 'pending' | 'success' | 'failed' | null;
  error?: string;
}

const supportedTokens: TokenData[] = [
  {
    label: 'ETH',
    value: 'Ethereum',
    img: ETHImg as StaticImageData,
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chain_id: 1,
    decimals: 18,
    chain: 'Ethereum',
    token_type: 'NATIVE',
  },
  {
    label: 'USDC',
    value: 'USD Coin',
    img: USDCImg as StaticImageData,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain_id: 1,
    decimals: 6,
    chain: 'Ethereum',
    token_type: 'ERC20',
  },
  {
    label: 'EURC',
    value: 'Euro Coin',
    img: EURCImg as StaticImageData,
    address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    chain_id: 1,
    decimals: 6,
    chain: 'Ethereum',
    token_type: 'ERC20',
  },
];

const getWeb3Provider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum;
  }
  throw new Error('No Web3 provider found');
};

export function Swaps() {
  const { address } = useWallet();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenPrice>>(
    {}
  );
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    { status: null }
  );

  const [walletBalances, setWalletBalances] = useState<
    Record<string, string>
  >({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const fetchTokenPrices = async () => {
    try {
      const prices: Record<string, TokenPrice> = {};

      for (const token of supportedTokens) {
        try {
          const response = await fetch(
            `https://api.coinbase.com/v2/prices/${token.label.toLowerCase()}-usd/buy`
          );
          const data = await response.json();
          if (data.data) {
            prices[token.label] = data.data;
          }
        } catch (error) {
          // console.error(`Failed to fetch price for ${token.label}:`, error);
        }
      }

      setTokenPrices(prices);
    } catch (error) {
      // console.error('Error fetching token prices:', error);
    }
  };

  const fetchWalletBalances = async (walletAddress: string) => {
    setIsLoadingBalances(true);
    try {
      const chainId = supportedTokens[0].chain_id;
      const response = await fetch(
        `/api/wallet-balance?address=${walletAddress}&chainId=${chainId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('Balance API error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data: Record<string, string> = await response.json();
      const formattedBalances: Record<string, string> = {};

      supportedTokens.forEach((token) => {
        const rawBalance = data[token.address.toLowerCase()];
        if (rawBalance) {
          const readableBalance = formatUnits(BigInt(rawBalance), token.decimals);
          formattedBalances[token.label] = readableBalance;
        } else {
          formattedBalances[token.label] = '0';
        }
      });
      setWalletBalances(formattedBalances);
    } catch (error) {
      // console.error('Error fetching wallet balances:', error);
      setWalletBalances({});
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const fetchQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setQuoteData(null);
      setToAmount('');
      return;
    }

    setIsLoadingQuote(true);
    try {
      const fromTokenData = supportedTokens.find((t) => t.label === fromToken);
      const toTokenData = supportedTokens.find((t) => t.label === toToken);

      if (!fromTokenData || !toTokenData) return;

      const amount = (
        BigInt(Math.floor(parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals)))
      ).toString();

      const queryParams = new URLSearchParams({
        src: fromTokenData.address,
        dst: toTokenData.address,
        amount: amount,
      });

      const apiUrl = `/api/swap-quote?${queryParams.toString()}`;

      // console.log('Calling quote API:', apiUrl);

      const response = await fetch(apiUrl);

      // console.log('Quote API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('Quote API error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Quote API response data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      setQuoteData(data);

      const readableAmount = formatUnits(BigInt(data.dstAmount), toTokenData.decimals);
      setToAmount(readableAmount);

    } catch (error) {
      // console.error('Error fetching quote:', error);
      setQuoteData(null);
      setToAmount('');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const executeTransaction = async (txData: SwapData['tx']) => {
    try {
      const provider = getWeb3Provider();

      await provider.request({ method: 'eth_requestAccounts' });

      const transactionParameters = {
        to: txData.to,
        from: txData.from,
        value: `0x${BigInt(txData.value).toString(16)}`,
        data: txData.data,
        gas: `0x${BigInt(txData.gas).toString(16)}`,
        gasPrice: `0x${BigInt(txData.gasPrice).toString(16)}`,
      };

      // console.log('Sending transaction with parameters:', transactionParameters);

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // console.log('Transaction sent with hash:', txHash);
      setTransactionStatus({ hash: txHash, status: 'pending' });

      const checkTransactionStatus = async () => {
        try {
          const receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });

          if (receipt) {
            if (receipt.status === '0x1') {
              setTransactionStatus({ hash: txHash, status: 'success' });
              setFromAmount('');
              setToAmount('');
              setQuoteData(null);

              if (address) {
                fetchWalletBalances(address);
              }
            } else {
              setTransactionStatus({
                hash: txHash,
                status: 'failed',
                error: 'Transaction failed',
              });
            }
          } else {
            setTimeout(checkTransactionStatus, 3000);
          }
        } catch (error) {
          // console.error('Error checking transaction status:', error);
          setTransactionStatus({
            hash: txHash,
            status: 'failed',
            error: 'Failed to check transaction status',
          });
        }
      };

      setTimeout(checkTransactionStatus, 3000);

      return txHash;
    } catch (error: any) {
      // console.error('Transaction execution error:', error);

      if (error.code === 4001) {
        setTransactionStatus({
          status: 'failed',
          error: 'Transaction rejected by user',
        });
      } else {
        setTransactionStatus({
          status: 'failed',
          error: error.message || 'Transaction failed',
        });
      }
      throw error;
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || !address || !quoteData) return;

    setIsSwapping(true);
    setTransactionStatus({ status: null });

    try {
      const fromTokenData = supportedTokens.find((t) => t.label === fromToken);
      const toTokenData = supportedTokens.find((t) => t.label === toToken);

      if (!fromTokenData || !toTokenData) return;

      const amount = (
        BigInt(Math.floor(parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals)))
      ).toString();


      const queryParams = new URLSearchParams({
        src: fromTokenData.address,
        dst: toTokenData.address,
        amount: amount,
        from: address,
        origin: address,
        slippage: '1',
      });

      const apiUrl = `/api/swap-calldata?${queryParams.toString()}`;

      // console.log('Calling swap API:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('Swap API error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data: SwapData = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // console.log('Transaction data:', data.tx);

      await executeTransaction(data.tx);
    } catch (error) {
      // console.error('Error preparing/executing swap:', error);
      setTransactionStatus({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to execute swap',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount('');
    setQuoteData(null);
    setTransactionStatus({ status: null });
  };

  const getTokenData = (label: string) =>
    supportedTokens.find((t) => t.label === label);

  const getUSDValue = (amount: string, tokenLabel: string) => {
    const price = tokenPrices[tokenLabel];
    if (!price || !amount || isNaN(parseFloat(amount))) return '$0.00';
    const value = parseFloat(amount) * parseFloat(price.amount);
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getExchangeRate = () => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0) return '';
    const rate = parseFloat(toAmount) / parseFloat(fromAmount);
    return `1 ${fromToken} = ${rate.toFixed(6)} ${toToken}`;
  };

  const getPriceImpact = () => {
    return '3%';
  };

  useEffect(() => {
    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (address) {
      fetchWalletBalances(address);
    } else {
      setWalletBalances({});
    }
  }, [address]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAmount, fromToken, toToken]);

  const currentFromTokenBalance = walletBalances[fromToken];
  const currentToTokenBalance = walletBalances[toToken];

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <Card className='glass-card border-white/10 bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Swap Tokens</span>
            <Button variant='ghost' size='icon' className='text-slate-400'>
              <Settings className='h-4 w-4' />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {!address && (
            <div className='p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
              <p className='text-sm text-yellow-200'>
                Please connect your wallet to start swapping
              </p>
            </div>
          )}
          {transactionStatus.status && (
            <div
              className={`p-4 rounded-lg border ${transactionStatus.status === 'pending'
                ? 'bg-blue-500/10 border-blue-500/20'
                : transactionStatus.status === 'success'
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
                }`}
            >
              <div className='flex items-center space-x-2'>
                {transactionStatus.status === 'pending' && (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin text-blue-400' />
                    <span className='text-sm text-blue-200'>
                      Transaction pending...
                    </span>
                  </>
                )}
                {transactionStatus.status === 'success' && (
                  <>
                    <CheckCircle className='h-4 w-4 text-green-400' />
                    <span className='text-sm text-green-200'>
                      Swap successful!
                    </span>
                  </>
                )}
                {transactionStatus.status === 'failed' && (
                  <>
                    <XCircle className='h-4 w-4 text-red-400' />
                    <span className='text-sm text-red-200'>
                      {transactionStatus.error || 'Transaction failed'}
                    </span>
                  </>
                )}
              </div>
              {transactionStatus.hash && (
                <div className='mt-2'>
                  <a
                    href={`https://etherscan.io/tx/${transactionStatus.hash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-blue-400 hover:text-blue-300 underline'
                  >
                    View on Etherscan
                  </a>
                </div>
              )}
            </div>
          )}

          <div className='space-y-2'>
            <label className='text-sm text-slate-400'>From</label>
            <div className='glass-card p-4 border-white/10'>
              <div className='flex items-center justify-between'>
                <Input
                  placeholder='0.0'
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className='border-0 bg-transparent text-2xl font-semibold text-white placeholder:text-slate-500 focus-visible:ring-0'
                  disabled={!address}
                />
                <div className='z-10'>
                  <TokenSelector
                    selectedToken={fromToken}
                    onTokenChange={setFromToken}
                    supportedTokens={supportedTokens}
                  />
                </div>
              </div>
              <div className='flex justify-between mt-2'>
                <span className='text-sm text-slate-400'>
                  {getUSDValue(fromAmount, fromToken)}
                </span>
                <span className='text-sm text-slate-400'>
                  Balance:{' '}
                  {isLoadingBalances && address ? (
                    <Loader2 className='h-3 w-3 inline-block animate-spin mr-1' />
                  ) : currentFromTokenBalance !== undefined ? (
                    `${parseFloat(currentFromTokenBalance).toFixed(4)}`
                  ) : (
                    '--'
                  )}{' '}
                  {fromToken}
                </span>
              </div>
            </div>
          </div>

          <div className='flex justify-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={swapTokens}
              className='rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10'
              disabled={isLoadingQuote || isSwapping}
            >
              <ArrowDown className='h-4 w-4' />
            </Button>
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-slate-400'>To</label>
            <div className='glass-card p-4 border-white/10'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  {isLoadingQuote && (
                    <Loader2 className='h-4 w-4 animate-spin text-slate-400 mr-2' />
                  )}
                  <Input
                    placeholder='0.0'
                    value={toAmount}
                    readOnly
                    className='border-0 bg-transparent text-2xl font-semibold text-white placeholder:text-slate-500 focus-visible:ring-0'
                  />
                </div>
                <div className='z-10'>
                  <TokenSelector
                    selectedToken={toToken}
                    onTokenChange={setToToken}
                    supportedTokens={supportedTokens}
                  />
                </div>
              </div>
              <div className='flex justify-between mt-2'>
                <span className='text-sm text-slate-400'>
                  {getUSDValue(toAmount, toToken)}
                </span>
                <span className='text-sm text-slate-400'>
                  Balance:{' '}
                  {isLoadingBalances && address ? (
                    <Loader2 className='h-3 w-3 inline-block animate-spin mr-1' />
                  ) : currentToTokenBalance !== undefined ? (
                    `${parseFloat(currentToTokenBalance).toFixed(4)}`
                  ) : (
                    '--'
                  )}{' '}
                  {toToken}
                </span>
              </div>
            </div>
          </div>

          {quoteData && (
            <div className='glass-card p-4 border-white/10 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-400'>Rate</span>
                <span className='text-white'>{getExchangeRate()}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-400'>Price Impact</span>
                <span className='text-green-400'>{getPriceImpact()}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-400'>Route</span>
                <span className='text-cyan-400'>1inch Fusion</span>
              </div>
            </div>
          )}

          <div className='flex items-center space-x-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg'>
            <Shield className='h-4 w-4 text-cyan-400' />
            <span className='text-sm text-cyan-100'>MEV Protection Enabled</span>
          </div>

          <Button
            onClick={handleSwap}
            disabled={
              !fromAmount ||
              !address ||
              !quoteData ||
              isSwapping ||
              transactionStatus.status === 'pending' ||
              parseFloat(fromAmount) === 0
            }
            className='w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white h-12 text-lg font-semibold animate-glow disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {!address ? (
              'Connect Wallet'
            ) : isSwapping ? (
              <>
                <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                Executing Swap...
              </>
            ) : transactionStatus.status === 'pending' ? (
              <>
                <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                Transaction Pending...
              </>
            ) : (
              <>
                <Zap className='h-5 w-5 mr-2' />
                Swap Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
