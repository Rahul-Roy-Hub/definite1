'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';

// Test address with real token holdings for demo purposes
// Using Binance hot wallet which has many tokens
const TEST_ADDRESS = '0x28C6c06298d514Db089934071355E5743bf21d60';

interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  price: number;
  value: number;
  valueFormatted: string;
  logoURI?: string;
  verified?: boolean;
  tags?: string[];
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  totalSupply?: string;
  chainId?: number;
  chainName?: string;
}

interface BalanceData {
  address: string;
  chainId: number;
  tokens: TokenBalance[];
  totalValue: number;
  totalValueFormatted: string;
}

interface UseTokenBalanceReturn {
  balanceData: BalanceData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isUsingTestAddress: boolean;
}

export function useTokenBalance(chainId: number = 1): UseTokenBalanceReturn {
  const { address, isConnected } = useAccount();
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAddress = useRef<string | null>(null);
  const isInitialized = useRef(false);
  const fetchInProgress = useRef(false);

  // Use connected address if available, otherwise use test address for demo
  const effectiveAddress = address || TEST_ADDRESS;
  const isUsingTestAddress = !address || address === TEST_ADDRESS;

  const fetchBalance = useCallback(async (forceRefresh = false) => {
    if (!effectiveAddress) {
      setBalanceData(null);
      return;
    }

    // Prevent duplicate requests
    if (fetchInProgress.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    // Prevent duplicate requests for the same address unless force refresh
    if (!forceRefresh && lastFetchedAddress.current === effectiveAddress) {
      console.log('Already fetched this address, skipping...');
      return;
    }

    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[HOOK] Fetching token balance for address: ${effectiveAddress} on chain: ${chainId}`);
      const url = new URL('/api/balance', window.location.origin);
      url.searchParams.set('address', effectiveAddress);
      url.searchParams.set('chainId', chainId.toString());
      if (forceRefresh) {
        url.searchParams.set('refresh', 'true');
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch balance data');
      }

      const data = await response.json();
      setBalanceData(data.data);
      lastFetchedAddress.current = effectiveAddress;

      console.log(`[HOOK] Successfully fetched balance for: ${effectiveAddress}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Balance fetch error:', err);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [effectiveAddress, chainId]);

  useEffect(() => {
    // Only fetch once on mount or when address/chainId changes
    if (!isInitialized.current || lastFetchedAddress.current !== effectiveAddress) {
      console.log(`[HOOK] useEffect triggered for address: ${effectiveAddress} on chain: ${chainId}`);
      isInitialized.current = true;
      fetchBalance();
    }
  }, [effectiveAddress, chainId]);

  return {
    balanceData,
    isLoading,
    error,
    refetch: () => fetchBalance(true),
    isUsingTestAddress,
  };
} 