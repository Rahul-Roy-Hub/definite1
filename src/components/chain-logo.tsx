'use client';

import { chainLogos, type ChainId } from '@/lib/utils';

interface ChainLogoProps {
  chainId: ChainId;
  className?: string;
}

export function ChainLogo({ chainId, className = "w-6 h-6" }: ChainLogoProps) {
  const logoPath = chainLogos[chainId];
  
  if (!logoPath) {
    return <span className={className}>?</span>;
  }

  return (
    <img 
      src={logoPath} 
      alt={`${chainId} logo`}
      className={className}
    />
  );
} 