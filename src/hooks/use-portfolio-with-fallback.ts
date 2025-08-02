'use client';

import { usePortfolio } from './use-portfolio';
import { PortfolioSummary } from '@/lib/types';

// Mock data for fallback
const mockPortfolioData: PortfolioSummary = {
  totalValue: 2847293.42,
  totalValueFormatted: '$2,847,293.42',
  chains: [
    {
      chainId: 1,
      chainName: 'Ethereum',
      value: 1947293.42,
      valueFormatted: '$1,947,293.42',
    },
    {
      chainId: 137,
      chainName: 'Polygon',
      value: 450000.00,
      valueFormatted: '$450,000.00',
    },
    {
      chainId: 42161,
      chainName: 'Arbitrum',
      value: 300000.00,
      valueFormatted: '$300,000.00',
    },
    {
      chainId: 8453,
      chainName: 'Base',
      value: 150000.00,
      valueFormatted: '$150,000.00',
    },
  ],
  categories: [
    {
      categoryId: 'tokens',
      categoryName: 'Tokens',
      value: 2547293.42,
      valueFormatted: '$2,547,293.42',
    },
    {
      categoryId: 'native',
      categoryName: 'Native',
      value: 300000.00,
      valueFormatted: '$300,000.00',
    },
  ],
};

interface UsePortfolioWithFallbackReturn {
  portfolio: PortfolioSummary;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isUsingFallback: boolean;
  isUsingTestAddress: boolean;
  isCached: boolean;
}

export function usePortfolioWithFallback(): UsePortfolioWithFallbackReturn {
  const { portfolio, isLoading, error, refetch, isUsingTestAddress, isCached } = usePortfolio();

  // Use real data if available, otherwise fall back to mock data
  const effectivePortfolio = portfolio || mockPortfolioData;
  const isUsingFallback = !portfolio;

  return {
    portfolio: effectivePortfolio,
    isLoading,
    error,
    refetch,
    isUsingFallback,
    isUsingTestAddress,
    isCached,
  };
}
