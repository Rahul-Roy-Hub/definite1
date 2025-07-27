'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface TokenSelectorProps {
  selectedToken: string;
  onTokenChange: (token: string) => void;
}

export function TokenSelector({ selectedToken, onTokenChange }: TokenSelectorProps) {
  return (
    <Button 
      variant="outline" 
      className="flex items-center space-x-2 bg-slate-800 border-white/20 hover:bg-slate-700"
    >
      <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs">{selectedToken.slice(0, 2)}</span>
      </div>
      <span className="text-white">{selectedToken}</span>
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </Button>
  );
}