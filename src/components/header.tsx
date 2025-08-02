'use client';

import { Button } from '@/components/ui/button';
import { Settings, Bell } from 'lucide-react';
import { WalletConnect } from './wallet-connect';
import Image from 'next/image';

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/definite1-logo.png"
                alt="DeFinite1 Logo"
                width={56}
                height={56}
                className="rounded-lg"
              />
              <span className="text-xl font-semibold text-white">
                DeFinite<span className="text-blue-400">1</span>
              </span>
            </div>
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