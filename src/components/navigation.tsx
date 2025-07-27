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
  { id: 'schedules', label: 'Schedules', icon: Calendar },
  { id: 'cross-chain', label: 'Cross-chain', icon: Network },
  { id: 'simulation', label: 'Simulation', icon: Shield },
] as const;

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="glass-card p-2">
      <nav className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200',
                'hover:bg-white/10',
                isActive && 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
              )}
            >
              <Icon className={cn(
                'h-4 w-4',
                isActive ? 'text-cyan-400' : 'text-slate-400'
              )} />
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'text-white' : 'text-slate-400'
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