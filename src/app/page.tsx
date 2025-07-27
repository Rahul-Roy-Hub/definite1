'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Overview } from '@/components/pages/overview';
import { Swaps } from '@/components/pages/swaps';
import { Schedules } from '@/components/pages/schedules';
import { CrossChain } from '@/components/pages/cross-chain';
import { Simulation } from '@/components/pages/simulation';
import { Header } from '@/components/header';

export type TabType = 'overview' | 'swaps' | 'schedules' | 'cross-chain' | 'simulation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'swaps':
        return <Swaps />;
      case 'schedules':
        return <Schedules />;
      case 'cross-chain':
        return <CrossChain />;
      case 'simulation':
        return <Simulation />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            DeFinite1
          </h1>
          <p className="text-slate-400">
            Non-custodial multi-chain treasury management dashboard
          </p>
        </div>
        
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}