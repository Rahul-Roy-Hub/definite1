'use client';

import { cn } from '@/lib/utils';
import { TabType } from '@/app/page';
import {
  BarChart3,
  ArrowLeftRight,
  Calendar,
  Network,
  Shield
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'swaps', label: 'Swaps', icon: ArrowLeftRight },
  { id: 'schedules', label: 'Orders Placed', icon: Calendar },
  { id: 'cross-chain', label: 'Cross-chain', icon: Network },
  { id: 'simulation', label: 'Simulation', icon: Shield },
] as const;

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="glass-card border-white/10 bg-white/5 p-3 rounded-xl">
      <nav className="flex items-center justify-between space-x-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={cn(
                'flex items-center space-x-3 px-6 py-4 rounded-lg transition-all duration-300',
                'hover:bg-white/10 hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'border border-transparent hover:border-white/20'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors duration-200',
                isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
              )} />
              <span className={cn(
                'text-sm font-semibold transition-colors duration-200',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}