import React from 'react';
import { ActiveTab } from '../types';
import { retroSound } from '../utils/sound';
import { LayoutDashboard, Users, CreditCard, Layers, ArrowLeftRight } from 'lucide-react';

interface PixelNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unpaidReceivablesCount: number;
  overdueReceivablesCount: number;
  unpaidDebtsCount?: number;
  overdueDebtsCount?: number;
}

export const PixelNavigation: React.FC<PixelNavigationProps> = ({
  activeTab,
  onChangeTab,
  unpaidReceivablesCount,
  overdueReceivablesCount,
  unpaidDebtsCount = 0,
  overdueDebtsCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Ringkasan',
      sublabel: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'receivables' as ActiveTab,
      label: 'Piutang',
      sublabel: 'Hak Tagih',
      icon: <Users size={18} />,
      badge: overdueReceivablesCount > 0 ? `${overdueReceivablesCount} OVERDUE` : unpaidReceivablesCount > 0 ? `${unpaidReceivablesCount}` : null,
      badgeColor: overdueReceivablesCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-black',
    },
    {
      id: 'debts' as ActiveTab,
      label: 'Utang',
      sublabel: 'Tanggungan',
      icon: <CreditCard size={18} />,
      badge: overdueDebtsCount > 0 ? `${overdueDebtsCount} OVERDUE` : unpaidDebtsCount > 0 ? `${unpaidDebtsCount}` : null,
      badgeColor: overdueDebtsCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-400 text-black',
    },
    {
      id: 'pots' as ActiveTab,
      label: 'Pos Anggaran',
      sublabel: 'Envelopes',
      icon: <Layers size={18} />,
    },
    {
      id: 'transactions' as ActiveTab,
      label: 'Transaksi',
      sublabel: 'Masuk & Keluar',
      icon: <ArrowLeftRight size={18} />,
    },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    retroSound.playClick();
    onChangeTab(tabId);
  };

  return (
    <nav className="bg-[#0f172a] border-b-2 border-black px-2 sm:px-6 py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex gap-2 sm:gap-4 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 border-2 border-black transition-all ${
                isActive
                  ? 'bg-[#f59e0b] text-black font-bold shadow-[3px_3px_0px_#000] -translate-y-0.5'
                  : 'bg-[#1e293b] text-slate-300 hover:bg-[#334155] hover:text-white shadow-[2px_2px_0px_#000]'
              }`}
            >
              <span className={isActive ? 'text-black' : 'text-amber-400'}>
                {tab.icon}
              </span>
              <div className="text-left">
                <div className="font-pixel text-[11px] sm:text-xs uppercase tracking-wider">
                  {tab.label}
                </div>
                <div className={`text-[9px] font-sans-clean ${isActive ? 'text-black/80 font-semibold' : 'text-slate-400'}`}>
                  {tab.sublabel}
                </div>
              </div>
              {tab.badge && (
                <span className={`ml-1 text-[9px] font-pixel px-1.5 py-0.5 border border-black ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
