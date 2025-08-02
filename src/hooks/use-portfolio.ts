'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

export function usePortfolio(): UsePortfolioReturn {
  const { address, isConnected } = useAccount();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use connected address if available, otherwise use test address for demo
  const effectiveAddress = address || TEST_ADDRESS;
  const isUsingTestAddress = !address || address === TEST_ADDRESS;

  const fetchPortfolio = useCallback(async () => {
    if (!effectiveAddress) {
      setPortfolio(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio?address=${effectiveAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio data');
      }

      const data = await response.json();
      setPortfolio(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Portfolio fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveAddress]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    isLoading,
    error,
    refetch: fetchPortfolio,
    isUsingTestAddress,
  };
}
