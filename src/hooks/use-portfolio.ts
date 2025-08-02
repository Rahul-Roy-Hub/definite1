'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { PortfolioSummary } from '@/lib/types';

// Test address with real token holdings for demo purposes
const TEST_ADDRESS = '0x000000000000000000000000000000000000dead';

interface UsePortfolioReturn {
  portfolio: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isUsingTestAddress: boolean;
  isCached: boolean;
}

export function usePortfolio(): UsePortfolioReturn {
  const { address, isConnected } = useAccount();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const lastFetchedAddress = useRef<string | null>(null);
  const isInitialized = useRef(false);
  const fetchInProgress = useRef(false);

  // Use connected address if available, otherwise use test address for demo
  const effectiveAddress = address || TEST_ADDRESS;
  const isUsingTestAddress = !address || address === TEST_ADDRESS;

  const fetchPortfolio = useCallback(async (forceRefresh = false) => {
    if (!effectiveAddress) {
      setPortfolio(null);
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
    setIsCached(false);

    try {
      console.log(`[HOOK] Fetching portfolio for address: ${effectiveAddress}`);
      const url = new URL('/api/portfolio', window.location.origin);
      url.searchParams.set('address', effectiveAddress);
      if (forceRefresh) {
        url.searchParams.set('refresh', 'true');
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio data');
      }

      const data = await response.json();
      setPortfolio(data.data);
      setIsCached(data.cached || false);
      lastFetchedAddress.current = effectiveAddress;

      console.log(`[HOOK] Successfully fetched portfolio for: ${effectiveAddress}`);

      // Log warnings if any
      if (data.warnings && data.warnings.length > 0) {
        console.warn('Portfolio API warnings:', data.warnings);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Portfolio fetch error:', err);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [effectiveAddress]); // Remove portfolio from dependencies

  useEffect(() => {
    // Only fetch once on mount or when address changes
    if (!isInitialized.current || lastFetchedAddress.current !== effectiveAddress) {
      console.log(`[HOOK] useEffect triggered for address: ${effectiveAddress}`);
      isInitialized.current = true;
      fetchPortfolio();
    }
  }, [effectiveAddress]); // Remove fetchPortfolio from dependencies

  return {
    portfolio,
    isLoading,
    error,
    refetch: () => fetchPortfolio(true),
    isUsingTestAddress,
    isCached,
  };
}
