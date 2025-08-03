// Test addresses with known token holdings for demonstration
export const TEST_ADDRESSES = {
  // Burn address - always has tokens from various burn operations
  BURN_ADDRESS: '0x000000000000000000000000000000000000dead',
  
  // Vitalik's address - might have interesting holdings
  VITALIK: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  
  // Uniswap V3 Router - has various token holdings
  UNISWAP_V3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  
  // 1inch Router - has token holdings from swaps
  ONEINCH_ROUTER: '0x1111111254eeb25477b68fb85ed929f73a960582',
} as const;

export type TestAddressKey = keyof typeof TEST_ADDRESSES;

// Get a test address by key
export function getTestAddress(key: TestAddressKey): string {
  return TEST_ADDRESSES[key];
}

// Check if an address is one of our test addresses
export function isTestAddress(address: string): boolean {
  return Object.values(TEST_ADDRESSES).includes(address as any);
}

// Get description for test addresses
export function getTestAddressDescription(address: string): string {
  switch (address) {
    case TEST_ADDRESSES.BURN_ADDRESS:
      return 'Universal burn address - receives tokens from burn operations across EVM chains';
    case TEST_ADDRESSES.VITALIK:
      return "Vitalik Buterin's address - Ethereum founder";
    case TEST_ADDRESSES.UNISWAP_V3:
      return 'Uniswap V3 Router - major DEX contract with various token holdings';
    case TEST_ADDRESSES.ONEINCH_ROUTER:
      return '1inch Router - aggregator contract with token holdings from swaps';
    default:
      return 'Test address with token holdings';
  }
}

// Format address for display
export function formatTestAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
