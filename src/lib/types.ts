// 1inch API Response Types
export interface OneInchPortfolioResponse {
  result: {
    total: number;
    by_address: Array<{
      value_usd: number;
      address: string;
    }>;
    by_category: Array<{
      value_usd: number;
      category_id: string;
      category_name: string;
    }>;
    by_protocol_group: Array<{
      value_usd: number;
      protocol_group_id: string;
      protocol_group_name: string;
    }>;
    by_chain: Array<{
      value_usd: number;
      chain_id: number;
      chain_name: string;
    }>;
  };
}

// Token Holdings Types
export interface TokenHolding {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  price: string;
  address?: string;
  chainId?: number;
}

// Portfolio Metrics Types
export interface PortfolioMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
}

// Portfolio Summary Types
export interface PortfolioSummary {
  totalValue: number;
  totalValueFormatted: string;
  chains: Array<{
    chainId: number;
    chainName: string;
    value: number;
    valueFormatted: string;
  }>;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    value: number;
    valueFormatted: string;
  }>;
}

// API Configuration
export interface OneInchConfig {
  apiKey: string;
  baseUrl: string;
}

// Supported Chain IDs
export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  BASE: 8453,
  OPTIMISM: 10,
} as const;

export type SupportedChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

// Chain Info
export interface ChainInfo {
  id: SupportedChainId;
  name: string;
  symbol: string;
  logo?: string;
}

export const CHAIN_INFO: Record<SupportedChainId, ChainInfo> = {
  [SUPPORTED_CHAINS.ETHEREUM]: {
    id: SUPPORTED_CHAINS.ETHEREUM,
    name: 'Ethereum',
    symbol: 'ETH',
    logo: '/ethereum-eth-logo.svg',
  },
  [SUPPORTED_CHAINS.POLYGON]: {
    id: SUPPORTED_CHAINS.POLYGON,
    name: 'Polygon',
    symbol: 'MATIC',
    logo: '/polygon-matic-logo.svg',
  },
  [SUPPORTED_CHAINS.ARBITRUM]: {
    id: SUPPORTED_CHAINS.ARBITRUM,
    name: 'Arbitrum',
    symbol: 'ARB',
    logo: '/arbitrum-arb-logo.svg',
  },
  [SUPPORTED_CHAINS.BASE]: {
    id: SUPPORTED_CHAINS.BASE,
    name: 'Base',
    symbol: 'ETH',
    logo: '/base-network-logo.svg',
  },
  [SUPPORTED_CHAINS.OPTIMISM]: {
    id: SUPPORTED_CHAINS.OPTIMISM,
    name: 'Optimism',
    symbol: 'OP',
    logo: '/optimism-ethereum-op-logo.svg',
  },
};
