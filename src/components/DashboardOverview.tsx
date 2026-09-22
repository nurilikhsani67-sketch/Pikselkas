import React, { useState } from 'react';
import { CategoryPot, Receivable, Debt, Transaction, ActiveTab } from '../types';
import { formatRupiah, formatDateIndo, getReceivableStatusInfo, getDebtStatusInfo } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { PixelIcon } from './PixelIcon';
import { PixelMascot } from './PixelMascot';
import { PlusCircle, UserPlus, FolderPlus, ArrowUpRight, ArrowDownLeft, AlertTriangle, CreditCard, CheckCircle2 } from 'lucide-react';

interface DashboardOverviewProps {
  pots: CategoryPot[];
  receivables: Receivable[];
  debts: Debt[];
  transactions: Transaction[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenNewReceivable: () => void;
  onOpenNewDebt?: () => void;
  onOpenNewPot: () => void;
  onPayReceivable: (receivable: Receivable) => void;
  onPayDebt?: (debt: Debt) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  pots,
  receivables,
  debts,
  transactions,
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewReceivable,
  onOpenNewDebt,
  onOpenNewPot,
  onPayReceivable,
  onPayDebt,
}) => {
  const [loanViewTab, setLoanViewTab] = useState<'debts' | 'receivables'>('debts');

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Active receivables (hak tagih kita)
  const outstandingReceivables = receivables
    .filter((r) => r.remainingAmount > 0)
    .reduce((acc, curr) => acc + curr.remainingAmount, 0);

  const overdueList = receivables.filter((r) => {
    if (r.remainingAmount <= 0) return false;
    const status = getReceivableStatusInfo(r.status, r.dueDate, r.remainingAmount);
    return status.label === 'JATUH TEMPO';
  });

  const unpaidCount = receivables.filter((r) => r.remainingAmount > 0).length;

  // Active debts (tanggungan utang kita)
  const outstandingDebts = debts
    .filter((d) => d.remainingAmount > 0)
    .reduce((acc, curr) => acc + curr.remainingAmount, 0);

  const totalPaidDebts = debts.reduce((acc, curr) => acc + curr.paidAmount, 0);

  const overdueDebtsList = debts.filter((d) => {
    if (d.remainingAmount <= 0) return false;
    const status = getDebtStatusInfo(d.status, d.dueDate, d.remainingAmount);
    return status.label === 'JATUH TEMPO';
  });

  const unpaidDebtsCount = debts.filter((d) => d.remainingAmount > 0).length;
  const paidDebtsCount = debts.filter((d) => d.remainingAmount <= 0).length;

  // Health Meter (0 to 100)
  // Higher if expense is lower than income, and few overdue debts/receivables
  let healthPercent = 100;
  if (totalIncome > 0) {
    const expenseRatio = totalExpense / totalIncome;
    healthPercent = Math.max(15, Math.min(100, Math.round((1 - expenseRatio * 0.7) * 100)));
  } else if (totalExpense > 0) {
    healthPercent = 25;
  }
  if (overdueList.length > 0) {
    healthPercent = Math.max(10, healthPercent - overdueList.length * 10);
  }
  if (overdueDebtsList.length > 0) {
    healthPercent = Math.max(5, healthPercent - overdueDebtsList.length * 15);
  }

  // Health Status Text
  const getHealthMeta = () => {
    if (healthPercent >= 75) return { text: 'SEHAT (KEBAL)', color: 'bg-emerald-500 text-black', barColor: 'bg-emerald-500' };
    if (healthPercent >= 45) return { text: 'CUKUP (WASPADA)', color: 'bg-amber-400 text-black', barColor: 'bg-amber-400' };
    return { text: 'KRITIS (DANGER)', color: 'bg-rose-500 text-white', barColor: 'bg-rose-500' };
  };

  const healthMeta = getHealthMeta();

  // Top 5 recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Pixel Mascot Speech Bar */}
      <PixelMascot 
        overdueCount={overdueList.length}
        healthPercent={healthPercent}
        totalReceivablesRemaining={outstandingReceivables}
        overdueDebtsCount={overdueDebtsList.length}
        totalDebtsRemaining={outstandingDebts}
      />

      {/* Main Stats Grid - 5 Adaptive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Saldo Kas */}
        <div className="bg-[#1e293b] border-4 border-black p-3.5 pixel-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-amber-400 tracking-wider">
              SALDO KAS
            </span>
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-500 flex items-center justify-center">
              <PixelIcon name="coin" size={16} className="animate-coin-spin" />
            </div>
          </div>
          <div className="font-pixel text-base sm:text-lg text-white mb-1.5 tracking-tight truncate">
            {formatRupiah(netBalance)}
          </div>
          <div className="text-[10px] text-slate-300 font-sans-clean flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-emerald-400"></span>
            Dana siap pakai
          </div>
        </div>

        {/* Card 2: Outstanding Utang (Tanggungan) */}
        <div className="bg-[#1e293b] border-4 border-black p-3.5 pixel-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-rose-400 tracking-wider">
              OUTSTANDING UTANG
            </span>
            <div className="w-7 h-7 bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="font-pixel text-base sm:text-lg text-rose-400 mb-1.5 tracking-tight truncate">
            {formatRupiah(outstandingDebts)}
          </div>
          <div className="text-[10px] text-slate-300 font-sans-clean flex items-center justify-between">
            <span className={overdueDebtsList.length > 0 ? 'text-rose-400 font-bold' : ''}>
              {unpaidDebtsCount} utang aktif {overdueDebtsList.length > 0 && `(⚠️${overdueDebtsList.length})`}
            </span>
            <button
              onClick={() => onNavigateTab('debts')}
              className="text-rose-400 hover:underline font-pixel text-[9px]"
            >
              LIHAT &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Outstanding Piutang (Hak Tagih) */}
        <div className="bg-[#1e293b] border-4 border-black p-3.5 pixel-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-sky-400 tracking-wider">
              OUTSTANDING PIUTANG
            </span>
            <div className="w-7 h-7 bg-sky-500/20 border border-sky-500 flex items-center justify-center">
              <PixelIcon name="scroll" size={16} />
            </div>
          </div>
          <div className="font-pixel text-base sm:text-lg text-sky-300 mb-1.5 tracking-tight truncate">
            {formatRupiah(outstandingReceivables)}
          </div>
          <div className="text-[10px] text-slate-300 font-sans-clean flex items-center justify-between">
            <span>{unpaidCount} peminjam</span>
            <button
              onClick={() => onNavigateTab('receivables')}
              className="text-[#f59e0b] hover:underline font-pixel text-[9px]"
            >
              LIHAT &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Pemasukan Bulan Ini */}
        <div className="bg-[#1e293b] border-4 border-black p-3.5 pixel-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-emerald-400 tracking-wider">
              TOTAL PEMASUKAN
            </span>
            <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="font-pixel text-base sm:text-lg text-emerald-400 mb-1.5 tracking-tight truncate">
            +{formatRupiah(totalIncome)}
          </div>
          <div className="text-[10px] text-slate-300 font-sans-clean">
            Kas & Reward masuk
          </div>
        </div>

        {/* Card 5: Pengeluaran Bulan Ini */}
        <div className="bg-[#1e293b] border-4 border-black p-3.5 pixel-card relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-rose-400 tracking-wider">
              TOTAL PENGELUARAN
            </span>
            <div className="w-7 h-7 bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="font-pixel text-base sm:text-lg text-rose-400 mb-1.5 tracking-tight truncate">
            -{formatRupiah(totalExpense)}
          </div>
          <div className="text-[10px] text-slate-300 font-sans-clean">
            Damage kas terpakai
          </div>
        </div>
      </div>

      {/* HP Bar Keuangan / Financial Health Meter */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <PixelIcon name="heart" size={20} />
            <h3 className="font-pixel text-xs sm:text-sm text-slate-200">
              HEALTH BAR KEUANGAN (HP KAS)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-pixel text-slate-300">STATUS:</span>
            <span className={`font-pixel text-[10px] px-2 py-0.5 border border-black ${healthMeta.color}`}>
              {healthMeta.text} ({healthPercent}/100 HP)
            </span>
          </div>
        </div>

        {/* Retro Notched HP Bar */}
        <div className="w-full bg-[#0f172a] h-6 border-2 border-black p-0.5 relative pixel-progress-track">
          <div
            className={`h-full transition-all duration-500 ${healthMeta.barColor}`}
            style={{ width: `${healthPercent}%` }}
          />
          {/* Grid notches */}
          <div className="absolute inset-0 grid grid-cols-10 pointer-events-none divide-x divide-black/40">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} />
            ))}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 font-sans-clean mt-2">
          Indikator rasio arus kas masuk vs keluar serta ketertiban tanggungan utang dan piutang. Jaga HP di atas 70% untuk ketahanan finansial!
        </p>
      </div>

      {/* Quick Action Pixel Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => {
            retroSound.playCoin();
            onOpenNewTransaction();
          }}
          className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[11px] sm:text-xs p-3 border-4 border-black flex items-center justify-center gap-1.5 font-bold"
        >
          <PlusCircle size={16} className="text-black" />
          <span>+ TRANSAKSI</span>
        </button>

        <button
          onClick={() => {
            retroSound.playClick();
            if (onOpenNewDebt) {
              onOpenNewDebt();
            } else {
              onNavigateTab('debts');
            }
          }}
          className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-[11px] sm:text-xs p-3 border-4 border-black flex items-center justify-center gap-1.5 font-bold"
        >
          <CreditCard size={16} />
          <span>+ CATAT UTANG</span>
        </button>

        <button
          onClick={() => {
            retroSound.playClick();
            onOpenNewReceivable();
          }}
          className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-[11px] sm:text-xs p-3 border-4 border-black flex items-center justify-center gap-1.5 font-bold"
        >
          <UserPlus size={16} className="text-black" />
          <span>+ PIUTANG</span>
        </button>

        <button
          onClick={() => {
            retroSound.playClick();
            onOpenNewPot();
          }}
          className="pixel-btn-action bg-sky-600 hover:bg-sky-500 text-white font-pixel text-[11px] sm:text-xs p-3 border-4 border-black flex items-center justify-center gap-1.5"
        >
          <FolderPlus size={16} />
          <span>+ POS BARU</span>
        </button>
      </div>

      {/* Two Column Layout: Utang & Piutang vs Ringkasan Pos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tab Switcher between Utang & Piutang */}
        <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black/50 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                {/* Switcher Buttons */}
                <div className="flex bg-[#0f172a] p-1 border-2 border-black gap-1">
                  <button
                    onClick={() => {
                      retroSound.playClick();
                      setLoanViewTab('debts');
                    }}
                    className={`font-pixel text-[10px] px-2.5 py-1 border transition-all ${
                      loanViewTab === 'debts'
                        ? 'bg-rose-600 text-white border-black font-bold shadow-[1px_1px_0px_#000]'
                        : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                  >
                    💳 UTANG ({unpaidDebtsCount})
                  </button>
                  <button
                    onClick={() => {
                      retroSound.playClick();
                      setLoanViewTab('receivables');
                    }}
                    className={`font-pixel text-[10px] px-2.5 py-1 border transition-all ${
                      loanViewTab === 'receivables'
                        ? 'bg-[#f59e0b] text-black border-black font-bold shadow-[1px_1px_0px_#000]'
                        : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                  >
                    📜 PIUTANG ({unpaidCount})
                  </button>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab(loanViewTab === 'debts' ? 'debts' : 'receivables')}
                className={`pixel-btn-action bg-[#0f172a] hover:bg-[#334155] border-2 border-black font-pixel text-[10px] px-2.5 py-1 ${
                  loanViewTab === 'debts' ? 'text-rose-400' : 'text-[#f59e0b]'
                }`}
              >
                KELOLA SEMUA &rarr;
              </button>
            </div>

            {loanViewTab === 'debts' ? (
              // DEBTS TAB ON DASHBOARD
              <div>
                {debts.filter((d) => d.remainingAmount > 0).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-sans-clean">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="font-pixel text-xs text-emerald-300">SEMUA UTANG SUDAH TERBAYAR!</p>
                    <p className="text-xs mt-1">Luar biasa! Kamu bebas dari seluruh tanggungan utang saat ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debts
                      .filter((d) => d.remainingAmount > 0)
                      .slice(0, 3)
                      .map((debt) => {
                        const statusInfo = getDebtStatusInfo(debt.status, debt.dueDate, debt.remainingAmount);
                        return (
                          <div
                            key={debt.id}
                            className="bg-[#0f172a] border-2 border-black p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-pixel text-xs text-white truncate">
                                  {debt.creditorName}
                                </span>
                                <span className={`text-[9px] font-pixel px-1.5 py-0.2 border ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 font-sans-clean flex items-center gap-2">
                                <span>Jatuh tempo: {formatDateIndo(debt.dueDate)}</span>
                                {debt.purpose && <span className="truncate max-w-[120px]">• {debt.purpose}</span>}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="text-right">
                                <div className="font-pixel text-xs text-rose-400 font-bold">
                                  {formatRupiah(debt.remainingAmount)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans-clean">
                                  dari {formatRupiah(debt.totalAmount)}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  retroSound.playCoin();
                                  if (onPayDebt) {
                                    onPayDebt(debt);
                                  } else {
                                    onNavigateTab('debts');
                                  }
                                }}
                                className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-[10px] px-2.5 py-1.5 border border-black font-bold"
                                title="Catat cicilan atau pelunasan utang"
                              >
                                BAYAR
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {overdueDebtsList.length > 0 && (
                  <div className="mt-4 p-2.5 bg-rose-950/60 border-2 border-rose-800 text-rose-300 text-xs font-sans-clean flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                    <span>Perhatian! Ada <strong>{overdueDebtsList.length} utang</strong> yang telah lewat dari tanggal jatuh tempo.</span>
                  </div>
                )}
              </div>
            ) : (
              // RECEIVABLES TAB ON DASHBOARD
              <div>
                {receivables.filter((r) => r.remainingAmount > 0).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-sans-clean">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="font-pixel text-xs text-slate-300">SEMUA PIUTANG LUNAS!</p>
                    <p className="text-xs mt-1">Tidak ada uang yang sedang dipinjam orang lain.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivables
                      .filter((r) => r.remainingAmount > 0)
                      .slice(0, 3)
                      .map((rec) => {
                        const statusInfo = getReceivableStatusInfo(rec.status, rec.dueDate, rec.remainingAmount);
                        return (
                          <div
                            key={rec.id}
                            className="bg-[#0f172a] border-2 border-black p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#000]"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-pixel text-xs text-white truncate">
                                  {rec.debtorName}
                                </span>
                                <span className={`text-[9px] font-pixel px-1.5 py-0.2 border ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 font-sans-clean flex items-center gap-2">
                                <span>Jatuh tempo: {formatDateIndo(rec.dueDate)}</span>
                                {rec.purpose && <span className="truncate max-w-[120px]">• {rec.purpose}</span>}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="text-right">
                                <div className="font-pixel text-xs text-amber-400">
                                  {formatRupiah(rec.remainingAmount)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans-clean">
                                  dari {formatRupiah(rec.totalAmount)}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  retroSound.playCoin();
                                  onPayReceivable(rec);
                                }}
                                className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[10px] px-2.5 py-1.5 border border-black font-bold"
                                title="Catat cicilan atau pelunasan piutang"
                              >
                                TERIMA
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {overdueList.length > 0 && (
                  <div className="mt-4 p-2.5 bg-rose-950/60 border-2 border-rose-800 text-rose-300 text-xs font-sans-clean flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                    <span>Perhatian! Ada <strong>{overdueList.length} piutang</strong> yang lewat dari tanggal jatuh tempo.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Ringkasan Pos-Pos Keuangan */}
        <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black/50 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏺</span>
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm text-amber-400">
                    POS-POS ANGGARAN
                  </h3>
                  <p className="text-[10px] text-slate-400 font-pixel">
                    Pemakaian kuota per kategori
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('pots')}
                className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] border-2 border-black text-[#f59e0b] font-pixel text-[10px] px-2.5 py-1"
              >
                KELOLA ({pots.length}) &rarr;
              </button>
            </div>

            <div className="space-y-3.5">
              {pots.slice(0, 4).map((pot) => {
                // Calculate expense for this pot
                const spent = transactions
                  .filter((t) => t.type === 'expense' && t.categoryPotId === pot.id)
                  .reduce((acc, curr) => acc + curr.amount, 0);

                const percent = pot.monthlyBudget > 0 ? Math.min(100, Math.round((spent / pot.monthlyBudget) * 100)) : 0;
                const isOver = spent > pot.monthlyBudget;

                return (
                  <div key={pot.id} className="bg-[#0f172a] border-2 border-black p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <PixelIcon name={pot.icon} size={16} />
                        <span className="font-pixel text-xs text-slate-200">
                          {pot.name}
                        </span>
                      </div>
                      <span className={`font-pixel text-[10px] ${isOver ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#1e293b] h-3 border border-black p-0.5 pixel-progress-track">
                      <div
                        className={`h-full ${
                          isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans-clean mt-1.5">
                      <span>Terpakai: <strong className="text-slate-200">{formatRupiah(spent)}</strong></span>
                      <span>Target: {formatRupiah(pot.monthlyBudget)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-sans-clean">
            <span>Alokasikan pengeluaran ke pos agar tidak boros!</span>
            <button
              onClick={onOpenNewPot}
              className="text-[#f59e0b] hover:underline font-pixel text-[10px]"
            >
              + POS BARU
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card">
        <div className="flex items-center justify-between border-b-2 border-black/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-amber-400">
                LOG TRANSAKSI TERAKHIR
              </h3>
              <p className="text-[10px] text-slate-400 font-pixel">
                Riwayat pemasukan & pengeluaran terkini
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] border-2 border-black text-[#f59e0b] font-pixel text-[10px] px-2.5 py-1"
          >
            LIHAT SEMUA ({transactions.length}) &rarr;
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-sans-clean">
            Belum ada catatan transaksi. Klik "+ Catat Transaksi" untuk memulai!
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentTransactions.map((trx) => {
              const pot = pots.find((p) => p.id === trx.categoryPotId);
              const isIncome = trx.type === 'income';

              return (
                <div key={trx.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate font-sans-clean">
                        {trx.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-sans-clean">
                        <span>{formatDateIndo(trx.date)}</span>
                        {pot && (
                          <span className="bg-slate-800 px-1.5 py-0.2 border border-slate-700 font-pixel text-[8px] text-amber-300">
                            {pot.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-pixel text-xs ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(trx.amount)}
                    </div>
                    {trx.receivableId && (
                      <span className="text-[8px] font-pixel text-sky-400 bg-sky-950 px-1 border border-sky-800">
                        DARI PIUTANG
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
