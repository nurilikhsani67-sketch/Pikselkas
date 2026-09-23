import React, { useState, useMemo } from 'react';
import { SavingsAccount, SavingsCategory, SavingsLog, CategoryPot, Transaction } from '../types';
import { formatRupiah, formatDateIndo, getSavingsCategoryInfo, getBankBadgeStyle } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Target, 
  ShieldCheck, 
  PiggyBank, 
  Copy, 
  Check, 
  Wallet,
  Sparkles
} from 'lucide-react';

interface SavingsManagerProps {
  savings: SavingsAccount[];
  pots: CategoryPot[];
  onAddSavings: (
    savingsData: Omit<SavingsAccount, 'id' | 'createdAt' | 'logs'>,
    deductFromPot?: boolean
  ) => void;
  onEditSavings: (updated: SavingsAccount) => void;
  onDeleteSavings: (id: string) => void;
  onDepositSavings: (id: string, amount: number, note?: string, potId?: string) => void;
  onWithdrawSavings: (id: string, amount: number, note?: string, potId?: string) => void;
}

export const SavingsManager: React.FC<SavingsManagerProps> = ({
  savings,
  pots,
  onAddSavings,
  onEditSavings,
  onDeleteSavings,
  onDepositSavings,
  onWithdrawSavings,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSavings, setEditingSavings] = useState<SavingsAccount | null>(null);
  const [depositTarget, setDepositTarget] = useState<SavingsAccount | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<SavingsAccount | null>(null);
  const [viewHistoryTarget, setViewHistoryTarget] = useState<SavingsAccount | null>(null);

  // Add / Edit Form State
  const [formBankName, setFormBankName] = useState('BCA');
  const [formCustomBank, setFormCustomBank] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formBalance, setFormBalance] = useState<string>('');
  const [formTargetAmount, setFormTargetAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<SavingsCategory>('emergency_fund');
  const [formNotes, setFormNotes] = useState('');
  const [formDeductCash, setFormDeductCash] = useState(false);
  const [formPotId, setFormPotId] = useState(pots[0]?.id || '');

  // Deposit / Withdraw Form State
  const [mutateAmount, setMutateAmount] = useState<string>('');
  const [mutateNote, setMutateNote] = useState<string>('');
  const [mutateSyncCash, setMutateSyncCash] = useState<boolean>(true);
  const [mutatePotId, setMutatePotId] = useState<string>(pots[0]?.id || '');

  // Indonesian Popular Banks Presets
  const popularBanks = [
    { name: 'BCA', fullName: 'BCA (Bank Central Asia)', icon: '🟦' },
    { name: 'Bank Mandiri', fullName: 'Bank Mandiri', icon: '🟨' },
    { name: 'BRI', fullName: 'Bank Rakyat Indonesia (BRI)', icon: '🔷' },
    { name: 'BNI', fullName: 'Bank Negara Indonesia (BNI)', icon: '🟧' },
    { name: 'BSI', fullName: 'Bank Syariah Indonesia (BSI)', icon: '🟩' },
    { name: 'Bank Jago', fullName: 'Bank Jago', icon: '🟨' },
    { name: 'SeaBank', fullName: 'SeaBank Indonesia', icon: '🟧' },
    { name: 'Blu by BCA', fullName: 'Blu by BCA Digital', icon: '🟦' },
    { name: 'Jenius BTPN', fullName: 'Jenius (Bank BTPN)', icon: '🟦' },
    { name: 'Lainnya', fullName: 'Bank Lain / Celengan', icon: '🏦' },
  ];

  // Aggregates
  const totalSavingsBalance = useMemo(() => {
    return savings.reduce((acc, curr) => acc + curr.balance, 0);
  }, [savings]);

  const totalTargetAmount = useMemo(() => {
    return savings.reduce((acc, curr) => acc + (curr.targetAmount || 0), 0);
  }, [savings]);

  const overallProgress = useMemo(() => {
    if (totalTargetAmount <= 0) return 0;
    return Math.min(100, Math.round((totalSavingsBalance / totalTargetAmount) * 100));
  }, [totalSavingsBalance, totalTargetAmount]);

  const largestAccount = useMemo(() => {
    if (savings.length === 0) return null;
    return [...savings].sort((a, b) => b.balance - a.balance)[0];
  }, [savings]);

  // Filtered savings
  const filteredSavings = useMemo(() => {
    return savings.filter((item) => {
      const matchCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery = 
        !searchQuery ||
        item.bankName.toLowerCase().includes(q) ||
        item.accountName.toLowerCase().includes(q) ||
        (item.accountNumber && item.accountNumber.includes(q)) ||
        (item.accountHolder && item.accountHolder.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      return matchCategory && matchQuery;
    });
  }, [savings, selectedCategoryFilter, searchQuery]);

  // Handlers
  const openAddModal = (presetBank?: string) => {
    retroSound.playClick();
    setEditingSavings(null);
    setFormBankName(presetBank || 'BCA');
    setFormCustomBank('');
    setFormAccountName('');
    setFormAccountNumber('');
    setFormAccountHolder('');
    setFormBalance('');
    setFormTargetAmount('');
    setFormCategory('emergency_fund');
    setFormNotes('');
    setFormDeductCash(false);
    setFormPotId(pots.find(p => p.name.toLowerCase().includes('tabungan'))?.id || pots[0]?.id || '');
    setIsAddModalOpen(true);
  };

  const openEditModal = (acc: SavingsAccount) => {
    retroSound.playClick();
    setEditingSavings(acc);
    const isPreset = popularBanks.some(b => b.name === acc.bankName);
    if (isPreset) {
      setFormBankName(acc.bankName);
      setFormCustomBank('');
    } else {
      setFormBankName('Lainnya');
      setFormCustomBank(acc.bankName);
    }
    setFormAccountName(acc.accountName);
    setFormAccountNumber(acc.accountNumber || '');
    setFormAccountHolder(acc.accountHolder || '');
    setFormBalance(acc.balance.toString());
    setFormTargetAmount(acc.targetAmount ? acc.targetAmount.toString() : '');
    setFormCategory(acc.category);
    setFormNotes(acc.notes || '');
    setFormDeductCash(false);
    setIsAddModalOpen(true);
  };

  const openDepositModal = (acc: SavingsAccount) => {
    retroSound.playClick();
    setDepositTarget(acc);
    setMutateAmount('');
    setMutateNote('');
    setMutateSyncCash(true);
    setMutatePotId(pots[0]?.id || '');
  };

  const openWithdrawModal = (acc: SavingsAccount) => {
    retroSound.playClick();
    setWithdrawTarget(acc);
    setMutateAmount('');
    setMutateNote('');
    setMutateSyncCash(true);
    setMutatePotId(pots[0]?.id || '');
  };

  const handleCopyAccountNumber = (acc: SavingsAccount) => {
    if (!acc.accountNumber) return;
    navigator.clipboard.writeText(acc.accountNumber);
    setCopiedId(acc.id);
    retroSound.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBank = formBankName === 'Lainnya' ? (formCustomBank.trim() || 'Bank Lain') : formBankName;
    const balanceNum = parseFloat(formBalance.replace(/[^0-9]/g, '')) || 0;
    const targetNum = formTargetAmount ? parseFloat(formTargetAmount.replace(/[^0-9]/g, '')) : undefined;

    if (!formAccountName.trim()) {
      alert('Mohon masukkan nama tabungan / tujuan rekening!');
      return;
    }

    if (editingSavings) {
      onEditSavings({
        ...editingSavings,
        bankName: finalBank,
        accountName: formAccountName.trim(),
        accountNumber: formAccountNumber.trim() || undefined,
        accountHolder: formAccountHolder.trim() || undefined,
        balance: balanceNum,
        targetAmount: targetNum,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      retroSound.playSuccess();
    } else {
      onAddSavings(
        {
          bankName: finalBank,
          accountName: formAccountName.trim(),
          accountNumber: formAccountNumber.trim() || undefined,
          accountHolder: formAccountHolder.trim() || undefined,
          balance: balanceNum,
          targetAmount: targetNum,
          category: formCategory,
          notes: formNotes.trim() || undefined,
        },
        formDeductCash && balanceNum > 0
      );
      retroSound.playCoin();
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTarget) return;
    const amountNum = parseFloat(mutateAmount.replace(/[^0-9]/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Masukkan nominal setoran yang valid!');
      return;
    }
    onDepositSavings(
      depositTarget.id,
      amountNum,
      mutateNote.trim() || undefined,
      mutateSyncCash ? mutatePotId : undefined
    );
    retroSound.playCoin();
    setDepositTarget(null);
  };

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawTarget) return;
    const amountNum = parseFloat(mutateAmount.replace(/[^0-9]/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Masukkan nominal penarikan yang valid!');
      return;
    }
    if (amountNum > withdrawTarget.balance) {
      alert(`Saldo tidak mencukupi! Saldo saat ini hanya ${formatRupiah(withdrawTarget.balance)}`);
      return;
    }
    onWithdrawSavings(
      withdrawTarget.id,
      amountNum,
      mutateNote.trim() || undefined,
      mutateSyncCash ? mutatePotId : undefined
    );
    retroSound.playSuccess();
    setWithdrawTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-6 pixel-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500/20 border-2 border-sky-500 flex items-center justify-center text-sky-400 shrink-0 shadow-[2px_2px_0px_#000]">
              <span className="text-2xl">🏦</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base sm:text-lg text-sky-400 tracking-wide">
                  TABUNGAN & REKENING BANK
                </h2>
                <span className="bg-emerald-600 text-black font-pixel text-[9px] px-2 py-0.5 border border-black font-bold">
                  SAFE VAULT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-sans-clean mt-0.5">
                Catat informasi nama bank, nomor rekening, nominal uang yang ditabung, dan target tabungan impianmu.
              </p>
            </div>
          </div>

          <button
            onClick={() => openAddModal()}
            className="pixel-btn-action bg-sky-500 hover:bg-sky-400 text-black font-pixel text-xs px-4 py-3 border-4 border-black flex items-center justify-center gap-2 font-bold shrink-0 self-start sm:self-auto"
          >
            <PlusCircle size={18} className="text-black" />
            <span>+ TAMBAH TABUNGAN</span>
          </button>
        </div>
      </div>

      {/* Main Aggregates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Saldo Tabungan */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-sky-400 tracking-wider">
              TOTAL SALDO TABUNGAN
            </span>
            <div className="w-7 h-7 bg-sky-500/20 border border-sky-500 flex items-center justify-center text-sky-400">
              <Building2 size={16} />
            </div>
          </div>
          <div className="font-pixel text-lg sm:text-xl text-white mb-1.5 tracking-tight truncate">
            {formatRupiah(totalSavingsBalance)}
          </div>
          <div className="text-[11px] text-slate-300 font-sans-clean flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-emerald-400"></span>
            Dari {savings.length} rekening bank terdaftar
          </div>
        </div>

        {/* Card 2: Target Akumulasi */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-amber-400 tracking-wider">
              TOTAL TARGET TABUNGAN
            </span>
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <Target size={16} />
            </div>
          </div>
          <div className="font-pixel text-lg sm:text-xl text-amber-300 mb-1.5 tracking-tight truncate">
            {totalTargetAmount > 0 ? formatRupiah(totalTargetAmount) : 'Tidak Dibatasi'}
          </div>
          <div className="text-[11px] text-slate-300 font-sans-clean">
            {totalTargetAmount > 0 ? `Target tercapai ${overallProgress}%` : 'Belum menetapkan target'}
          </div>
        </div>

        {/* Card 3: Rekening Saldo Terbesar */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-emerald-400 tracking-wider">
              REKENING UTAMA
            </span>
            <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="font-pixel text-base sm:text-lg text-emerald-400 mb-1.5 tracking-tight truncate">
            {largestAccount ? largestAccount.bankName : '-'}
          </div>
          <div className="text-[11px] text-slate-300 font-sans-clean truncate">
            {largestAccount ? `${formatRupiah(largestAccount.balance)} (${largestAccount.accountName})` : 'Belum ada data'}
          </div>
        </div>

        {/* Card 4: Progress Bar Global */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-pixel text-[9px] text-slate-300 tracking-wider">
              CAPAIAN TARGET GLOBAL
            </span>
            <span className="font-pixel text-[10px] text-amber-400">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-[#0f172a] h-4 border-2 border-black p-0.5 relative pixel-progress-track mb-2">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-sans-clean flex items-center justify-between">
            <span>Terkumpul: {formatRupiah(totalSavingsBalance)}</span>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama bank, rekening, pemilik (BCA, Mandiri, Darurat)..."
              className="w-full bg-[#0f172a] border-2 border-black pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Bank Button Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-pixel text-slate-400 shrink-0 hidden sm:inline">BANK CEPAT:</span>
            {popularBanks.slice(0, 5).map((b) => (
              <button
                key={b.name}
                onClick={() => openAddModal(b.name)}
                className="font-pixel text-[9px] bg-[#0f172a] hover:bg-[#334155] text-sky-300 border-2 border-black px-2 py-1.5 shrink-0"
                title={`Tambah rekening ${b.name}`}
              >
                + {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-black/40">
          <button
            onClick={() => {
              retroSound.playClick();
              setSelectedCategoryFilter('all');
            }}
            className={`font-pixel text-[10px] px-3 py-1.5 border-2 border-black transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-sky-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-[#0f172a] text-slate-300 hover:text-white'
            }`}
          >
            SEMUA REKENING ({savings.length})
          </button>

          {(['emergency_fund', 'daily', 'dream_goal', 'family', 'investment_buffer', 'other'] as SavingsCategory[]).map((cat) => {
            const catInfo = getSavingsCategoryInfo(cat);
            const count = savings.filter(s => s.category === cat).length;
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  retroSound.playClick();
                  setSelectedCategoryFilter(cat);
                }}
                className={`font-pixel text-[10px] px-2.5 py-1.5 border-2 border-black flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-sky-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-[#0f172a] text-slate-300 hover:text-white'
                }`}
              >
                <span>{catInfo.icon}</span>
                <span>{catInfo.label}</span>
                <span className="text-[9px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Savings Cards Grid */}
      <div className="space-y-4">
        {filteredSavings.length === 0 ? (
          <div className="bg-[#1e293b] border-4 border-black p-8 text-center pixel-card">
            <div className="text-4xl mb-3">🏦</div>
            <h3 className="font-pixel text-sm text-slate-200 mb-1">
              BELUM ADA REKENING TABUNGAN
            </h3>
            <p className="text-xs text-slate-400 font-sans-clean max-w-md mx-auto mb-4">
              {searchQuery || selectedCategoryFilter !== 'all'
                ? 'Tidak ada tabungan yang cocok dengan pencarian atau filter kategori.'
                : 'Mulai catat rekening bank Anda (BCA, Mandiri, BRI, BSI, dll) dan pantau nominal uang yang sudah ditabung!'}
            </p>
            <button
              onClick={() => openAddModal()}
              className="pixel-btn-action bg-sky-500 hover:bg-sky-400 text-black font-pixel text-xs px-4 py-2.5 border-4 border-black font-bold inline-flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>+ TAMBAH TABUNGAN PERTAMA</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSavings.map((acc) => {
              const catInfo = getSavingsCategoryInfo(acc.category);
              const bankBadge = getBankBadgeStyle(acc.bankName);
              const hasTarget = Boolean(acc.targetAmount && acc.targetAmount > 0);
              const progress = hasTarget ? Math.min(100, Math.round((acc.balance / (acc.targetAmount || 1)) * 100)) : 0;

              return (
                <div
                  key={acc.id}
                  className="bg-[#1e293b] border-4 border-black p-4 pixel-card flex flex-col justify-between hover:border-sky-400/70 transition-all relative group"
                >
                  <div>
                    {/* Top Row: Bank Badge & Category */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        {/* Bank Pixel Badge */}
                        <div className={`font-pixel text-[10px] px-2.5 py-1 border-2 border-black font-bold ${bankBadge.bg} ${bankBadge.text} shadow-[1px_1px_0px_#000]`}>
                          {acc.bankName}
                        </div>
                        <span className={`font-pixel text-[9px] px-2 py-0.5 border flex items-center gap-1 ${catInfo.badgeColor}`}>
                          <span>{catInfo.icon}</span>
                          <span>{catInfo.label.toUpperCase()}</span>
                        </span>
                      </div>

                      {hasTarget && (
                        <span className={`font-pixel text-[9px] px-2 py-0.5 border ${
                          progress >= 100
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-amber-950/80 border-amber-500 text-amber-300'
                        }`}>
                          {progress >= 100 ? 'TARGET TERCAPAI! 🎉' : `${progress}% TARGET`}
                        </span>
                      )}
                    </div>

                    {/* Account Name & Number */}
                    <div className="mb-3">
                      <h4 className="font-pixel text-sm text-white flex items-center gap-1.5">
                        <span>{acc.accountName}</span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-sans-clean text-slate-400 mt-1">
                        {acc.accountNumber && (
                          <div className="flex items-center gap-1 bg-[#0f172a] px-2 py-0.5 border border-black text-slate-300 font-mono">
                            <span>{acc.accountNumber}</span>
                            <button
                              onClick={() => handleCopyAccountNumber(acc)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Salin nomor rekening"
                            >
                              {copiedId === acc.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        )}
                        {acc.accountHolder && (
                          <span>a.n. <strong className="text-slate-200">{acc.accountHolder}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Main Balance Box */}
                    <div className="bg-[#0f172a] border-2 border-black p-3.5 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-pixel text-[10px] text-slate-400 tracking-wider">
                          NOMINAL UANG YANG DITABUNG:
                        </span>
                        <PiggyBank size={16} className="text-sky-400" />
                      </div>
                      <div className="font-pixel text-lg sm:text-xl text-sky-300 tracking-tight truncate">
                        {formatRupiah(acc.balance)}
                      </div>

                      {/* Target Progress Bar if set */}
                      {hasTarget && acc.targetAmount && (
                        <div className="mt-2.5 pt-2.5 border-t border-black/60">
                          <div className="flex items-center justify-between text-[11px] font-sans-clean text-slate-400 mb-1">
                            <span>Target: <strong className="text-slate-200 font-pixel text-[10px]">{formatRupiah(acc.targetAmount)}</strong></span>
                            <span className="font-pixel text-[10px] text-amber-400">{progress}%</span>
                          </div>
                          <div className="w-full bg-[#1e293b] h-3 border border-black p-0.5 relative pixel-progress-track">
                            <div
                              className={`h-full transition-all duration-500 ${
                                progress >= 100 ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes if any */}
                    {acc.notes && (
                      <p className="text-[11px] text-slate-300 font-sans-clean italic bg-[#0f172a]/50 p-2 border border-black/40 mb-3">
                        "{acc.notes}"
                      </p>
                    )}
                  </div>

                  {/* Bottom Actions: Setor, Tarik, History, Edit, Delete */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-black/40 gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openDepositModal(acc)}
                        className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[10px] px-2.5 py-1.5 border border-black font-bold flex items-center gap-1"
                        title="Setor uang ke tabungan ini"
                      >
                        <ArrowDownLeft size={13} />
                        <span>+ SETOR</span>
                      </button>

                      <button
                        onClick={() => openWithdrawModal(acc)}
                        className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-amber-400 font-pixel text-[10px] px-2.5 py-1.5 border border-black flex items-center gap-1"
                        title="Tarik sebagian tabungan"
                      >
                        <ArrowUpRight size={13} />
                        <span>- TARIK</span>
                      </button>

                      <button
                        onClick={() => {
                          retroSound.playClick();
                          setViewHistoryTarget(acc);
                        }}
                        className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-[10px] px-2 py-1.5 border border-black flex items-center gap-1"
                        title="Lihat riwayat mutasi tabungan"
                      >
                        <History size={13} />
                        <span>MUTASI ({acc.logs?.length || 0})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(acc)}
                        className="p-1.5 text-slate-400 hover:text-white bg-[#0f172a] border border-black hover:border-slate-500"
                        title="Edit data tabungan & rekening"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus pencatatan tabungan ${acc.bankName} - ${acc.accountName}?`)) {
                            retroSound.playDelete();
                            onDeleteSavings(acc.id);
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 bg-[#0f172a] border border-black hover:border-rose-800"
                        title="Hapus tabungan ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Input / Edit Tabungan (Form Utama) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-xl p-4 sm:p-6 pixel-modal my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏦</span>
                <h3 className="font-pixel text-sm sm:text-base text-sky-400">
                  {editingSavings ? 'EDIT DATA TABUNGAN' : 'INPUT TABUNGAN & REKENING BARU'}
                </h3>
              </div>
              <button
                onClick={() => {
                  retroSound.playClick();
                  setIsAddModalOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSavings} className="space-y-4">
              {/* 1. Pilih Nama Bank */}
              <div>
                <label className="block font-pixel text-xs text-sky-300 mb-1.5">
                  1. PILIH NAMA BANK / LEMBAGA *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2">
                  {popularBanks.map((b) => {
                    const isSelected = formBankName === b.name;
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => {
                          retroSound.playClick();
                          setFormBankName(b.name);
                        }}
                        className={`p-2 border-2 border-black flex flex-col items-center justify-center gap-0.5 transition-all text-center ${
                          isSelected
                            ? 'bg-sky-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                            : 'bg-[#0f172a] text-slate-300 hover:bg-[#1e293b] hover:text-white'
                        }`}
                      >
                        <span className="text-base">{b.icon}</span>
                        <span className="font-pixel text-[9px] leading-tight truncate w-full">
                          {b.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {formBankName === 'Lainnya' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      value={formCustomBank}
                      onChange={(e) => setFormCustomBank(e.target.value)}
                      placeholder="Masukkan nama bank custom / celengan fisik..."
                      className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400"
                    />
                  </div>
                )}
              </div>

              {/* 2. Nama Tabungan / Tujuan */}
              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  NAMA TABUNGAN / TUJUAN REKENING *
                </label>
                <input
                  type="text"
                  required
                  value={formAccountName}
                  onChange={(e) => setFormAccountName(e.target.value)}
                  placeholder="Contoh: Tabungan Dana Darurat 6 Bulan / Rekening Gaji / Tabungan Haji"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* 3. Nomor Rekening & Nama Pemilik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                    NOMOR REKENING (OPSIONAL)
                  </label>
                  <input
                    type="text"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    placeholder="Contoh: 527-019-8821"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                    NAMA PEMILIK REKENING (OPSIONAL)
                  </label>
                  <input
                    type="text"
                    value={formAccountHolder}
                    onChange={(e) => setFormAccountHolder(e.target.value)}
                    placeholder="Contoh: Nuril Ikhsani"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* 4. Nominal Uang yang Ditabung & Target Tabungan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[11px] text-sky-300 mb-1">
                    NOMINAL UANG YANG DITABUNG (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formBalance}
                    onChange={(e) => setFormBalance(e.target.value)}
                    placeholder="Contoh: 15000000"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-sky-300 font-bold placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[11px] text-amber-300 mb-1">
                    TARGET NOMINAL TABUNGAN (RP) (OPSIONAL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                    placeholder="Contoh: 30000000"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-amber-300 placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 5. Kategori Tabungan */}
              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  KATEGORI FUNGSI TABUNGAN
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as SavingsCategory)}
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white font-sans-clean focus:outline-none focus:border-sky-400"
                >
                  <option value="emergency_fund">🛡️ Dana Darurat (Proteksi & Keamanan)</option>
                  <option value="daily">💳 Operasional & Rekening Gaji</option>
                  <option value="dream_goal">✨ Target Impian (Liburan, Gadget, Wishlist)</option>
                  <option value="family">👨‍👩‍👧 Keluarga, Qurban, & Pendidikan Anak</option>
                  <option value="investment_buffer">📈 Buffer Dana Investasi</option>
                  <option value="other">🐷 Tabungan Lainnya / Celengan</option>
                </select>
              </div>

              {/* 6. Opsi Sinkronisasi Pot Kas Awal */}
              {!editingSavings && (
                <div className="bg-[#0f172a] p-3 border-2 border-black space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-sans-clean">
                    <input
                      type="checkbox"
                      checked={formDeductCash}
                      onChange={(e) => setFormDeductCash(e.target.checked)}
                      className="accent-sky-500 w-4 h-4"
                    />
                    <span>Catat saldo awal ini sebagai pengeluaran kas otomatis</span>
                  </label>

                  {formDeductCash && (
                    <div className="pt-2 border-t border-black/40">
                      <label className="block font-pixel text-[10px] text-slate-400 mb-1">
                        POTONG DARI POS ANGGARAN:
                      </label>
                      <select
                        value={formPotId}
                        onChange={(e) => setFormPotId(e.target.value)}
                        className="w-full bg-[#1e293b] border border-black px-2.5 py-1.5 text-xs text-white font-sans-clean focus:outline-none focus:border-sky-400"
                      >
                        {pots.map((pot) => (
                          <option key={pot.id} value={pot.id}>
                            {pot.name} ({formatRupiah(pot.monthlyBudget)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* 7. Catatan */}
              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  CATATAN / PENGINGAT (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Bebas biaya admin bulanan, bunga 3% p.a., jatah autodebet tanggal 25"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-xs px-4 py-2.5 border-2 border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-sky-500 hover:bg-sky-400 text-black font-pixel text-xs px-5 py-2.5 border-4 border-black font-bold flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{editingSavings ? 'SIMPAN PERUBAHAN' : 'SIMPAN REKENING TABUNGAN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Setor Uang ke Tabungan */}
      {depositTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-md p-5 pixel-modal">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ArrowDownLeft size={18} className="text-emerald-400" />
                <h3 className="font-pixel text-xs sm:text-sm text-emerald-400">
                  SETOR UANG KE TABUNGAN
                </h3>
              </div>
              <button
                onClick={() => setDepositTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div className="bg-[#0f172a] p-3 border-2 border-black text-xs font-sans-clean">
                <div className="font-pixel text-white mb-1">{depositTarget.bankName} - {depositTarget.accountName}</div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Saldo Saat Ini:</span>
                  <span className="font-pixel text-sky-300">{formatRupiah(depositTarget.balance)}</span>
                </div>
              </div>

              <div>
                <label className="block font-pixel text-xs text-emerald-300 mb-1.5">
                  NOMINAL YANG DISETOR (RP) *:
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={mutateAmount}
                  onChange={(e) => setMutateAmount(e.target.value)}
                  placeholder="Contoh: 1000000"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2.5 text-sm text-emerald-400 font-sans-clean font-bold focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  KETERANGAN SETORAN (OPSIONAL):
                </label>
                <input
                  type="text"
                  value={mutateNote}
                  onChange={(e) => setMutateNote(e.target.value)}
                  placeholder="Contoh: Sisihan gaji bulanan / THR"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="bg-[#0f172a] p-2.5 border border-black space-y-2 text-xs font-sans-clean">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={mutateSyncCash}
                    onChange={(e) => setMutateSyncCash(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>Potong otomatis dari pengeluaran pos kas</span>
                </label>

                {mutateSyncCash && (
                  <div className="pt-1.5 border-t border-black/40">
                    <label className="block font-pixel text-[9px] text-slate-400 mb-1">
                      POS ANGGARAN SUMBER DANA:
                    </label>
                    <select
                      value={mutatePotId}
                      onChange={(e) => setMutatePotId(e.target.value)}
                      className="w-full bg-[#1e293b] border border-black px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      {pots.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
                <button
                  type="button"
                  onClick={() => setDepositTarget(null)}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-[11px] px-3 py-2 border border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[11px] px-4 py-2 border-2 border-black font-bold"
                >
                  KONFIRMASI SETOR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tarik Uang dari Tabungan */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-md p-5 pixel-modal">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight size={18} className="text-amber-400" />
                <h3 className="font-pixel text-xs sm:text-sm text-amber-400">
                  TARIK DANA TABUNGAN
                </h3>
              </div>
              <button
                onClick={() => setWithdrawTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="space-y-4">
              <div className="bg-[#0f172a] p-3 border-2 border-black text-xs font-sans-clean">
                <div className="font-pixel text-white mb-1">{withdrawTarget.bankName} - {withdrawTarget.accountName}</div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Saldo Saat Ini:</span>
                  <span className="font-pixel text-sky-300">{formatRupiah(withdrawTarget.balance)}</span>
                </div>
              </div>

              <div>
                <label className="block font-pixel text-xs text-amber-300 mb-1.5">
                  NOMINAL YANG DITARIK (RP) *:
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={withdrawTarget.balance}
                  step="1000"
                  value={mutateAmount}
                  onChange={(e) => setMutateAmount(e.target.value)}
                  placeholder="Contoh: 500000"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2.5 text-sm text-amber-300 font-sans-clean font-bold focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  KEPERLUAN PENARIKAN (OPSIONAL):
                </label>
                <input
                  type="text"
                  value={mutateNote}
                  onChange={(e) => setMutateNote(e.target.value)}
                  placeholder="Contoh: Kebutuhan darurat / belanja rencana"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="bg-[#0f172a] p-2.5 border border-black space-y-2 text-xs font-sans-clean">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={mutateSyncCash}
                    onChange={(e) => setMutateSyncCash(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <span>Masukkan dana penarikan sebagai pemasukan kas</span>
                </label>

                {mutateSyncCash && (
                  <div className="pt-1.5 border-t border-black/40">
                    <label className="block font-pixel text-[9px] text-slate-400 mb-1">
                      MASUKKAN KE POS KAS:
                    </label>
                    <select
                      value={mutatePotId}
                      onChange={(e) => setMutatePotId(e.target.value)}
                      className="w-full bg-[#1e293b] border border-black px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {pots.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
                <button
                  type="button"
                  onClick={() => setWithdrawTarget(null)}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-[11px] px-3 py-2 border border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-amber-400 hover:bg-amber-300 text-black font-pixel text-[11px] px-4 py-2 border-2 border-black font-bold"
                >
                  KONFIRMASI TARIK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Riwayat Mutasi Tabungan */}
      {viewHistoryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-lg p-5 pixel-modal max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <History size={18} className="text-sky-400" />
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm text-sky-400">
                    RIWAYAT MUTASI TABUNGAN
                  </h3>
                  <p className="text-[11px] text-slate-300 font-sans-clean">
                    {viewHistoryTarget.bankName} - {viewHistoryTarget.accountName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewHistoryTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#0f172a] p-3 border-2 border-black mb-3 shrink-0 flex items-center justify-between text-xs font-sans-clean">
              <span className="text-slate-400">Saldo Rekening Saat Ini:</span>
              <span className="font-pixel text-sm text-sky-300">{formatRupiah(viewHistoryTarget.balance)}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(!viewHistoryTarget.logs || viewHistoryTarget.logs.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs font-sans-clean">
                  Belum ada catatan mutasi setor/tarik pada rekening ini.
                </div>
              ) : (
                viewHistoryTarget.logs.map((log) => {
                  const isDeposit = log.type === 'deposit';
                  return (
                    <div
                      key={log.id}
                      className="bg-[#0f172a] border border-black p-2.5 flex items-center justify-between gap-3 text-xs font-sans-clean"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 border flex items-center justify-center shrink-0 ${
                          isDeposit
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-amber-500/20 border-amber-500 text-amber-400'
                        }`}>
                          {isDeposit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {isDeposit ? 'Setoran Tabungan' : 'Penarikan Tabungan'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDateIndo(log.date)} {log.note && `• ${log.note}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-pixel text-xs ${isDeposit ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isDeposit ? '+' : '-'}{formatRupiah(log.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-black mt-3 shrink-0 flex justify-end">
              <button
                onClick={() => setViewHistoryTarget(null)}
                className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-xs px-4 py-2 border border-black"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
