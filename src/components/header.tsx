'use client';

import { Button } from '@/components/ui/button';
import { Settings, Bell } from 'lucide-react';
import { WalletConnect } from './wallet-connect';

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D1</span>
            </div>
            <span className="text-xl font-semibold">DeFinite1</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}