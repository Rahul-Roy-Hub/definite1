import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Chain logo mapping
export const chainLogos = {
  ethereum: '/ethereum-eth-logo.svg',
  polygon: '/polygon-matic-logo.svg',
  arbitrum: '/arbitrum-arb-logo.svg',
  optimism: '/optimism-ethereum-op-logo.svg',
  base: '/base-network-logo.svg',
} as const;

export type ChainId = keyof typeof chainLogos;
