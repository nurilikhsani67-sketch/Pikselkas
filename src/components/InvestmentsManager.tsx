import React, { useState, useMemo } from 'react';
import { Investment, InvestmentType, CategoryPot, Transaction } from '../types';
import { formatRupiah, formatDateIndo, getInvestmentTypeInfo, calculateProfitLoss } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Coins, 
  X, 
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface InvestmentsManagerProps {
  investments: Investment[];
  pots: CategoryPot[];
  onAddInvestment: (
    investmentData: Omit<Investment, 'id' | 'createdAt' | 'status'>,
    deductFromPot?: boolean
  ) => void;
  onEditInvestment: (updated: Investment) => void;
  onDeleteInvestment: (id: string) => void;
  onUpdateCurrentValue: (id: string, newCurrentAmount: number) => void;
  onSellInvestment?: (id: string, soldAmount: number, targetPotId?: string) => void;
}

export const InvestmentsManager: React.FC<InvestmentsManagerProps> = ({
  investments,
  pots,
  onAddInvestment,
  onEditInvestment,
  onDeleteInvestment,
  onUpdateCurrentValue,
  onSellInvestment,
}) => {
  // Filter and search state
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [valuingInvestment, setValuingInvestment] = useState<Investment | null>(null);
  const [sellingInvestment, setSellingInvestment] = useState<Investment | null>(null);

  // Form states for Add / Edit
  const [formType, setFormType] = useState<InvestmentType>('saham');
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState('');
  const [formBuyDate, setFormBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [formInitialAmount, setFormInitialAmount] = useState<string>('');
  const [formCurrentAmount, setFormCurrentAmount] = useState<string>('');
  const [formUnits, setFormUnits] = useState<string>('');
  const [formCategoryPotId, setFormCategoryPotId] = useState<string>(pots[0]?.id || '');
  const [formNotes, setFormNotes] = useState('');
  const [formDeductCash, setFormDeductCash] = useState(false);

  // Quick Update Valuation Form State
  const [newValuationInput, setNewValuationInput] = useState<string>('');

  // Sell Form State
  const [sellAmountInput, setSellAmountInput] = useState<string>('');
  const [sellTargetPotId, setSellTargetPotId] = useState<string>(pots[0]?.id || '');

  // Available investment types for the selector
  const investmentTypesList: { type: InvestmentType; label: string; icon: string; description: string }[] = [
    { type: 'saham', label: 'Saham', icon: '📈', description: 'Ekuitas emiten bursa (IDX, US Stocks)' },
    { type: 'emas', label: 'Emas Mulia', icon: '🪙', description: 'Logam mulia batangan / digital (Antam, UBS)' },
    { type: 'obligasi', label: 'Obligasi / SBN', icon: '📜', description: 'Surat Berharga Negara (ORI, SR, Sukuk, FR)' },
    { type: 'reksadana', label: 'Reksadana', icon: '📊', description: 'Pasar uang, pendapatan tetap, campuran, saham' },
    { type: 'kripto', label: 'Kripto', icon: '⚡', description: 'Aset digital Bitcoin, Ethereum, Altcoins' },
    { type: 'deposito', label: 'Deposito', icon: '🏦', description: 'Simpanan berjangka perbankan / BPR' },
    { type: 'properti', label: 'Properti', icon: '🏠', description: 'Tanah kavling, kos-kosan, ruko, apartemen' },
    { type: 'lainnya', label: 'Lainnya', icon: '💎', description: 'Koleksi, modal usaha mikro, peer-to-peer, dll.' },
  ];

  // Portfolio aggregates
  const activeInvestments = useMemo(() => {
    return investments.filter((inv) => inv.status !== 'sold');
  }, [investments]);

  const totalInitial = useMemo(() => {
    return activeInvestments.reduce((acc, curr) => acc + curr.initialAmount, 0);
  }, [activeInvestments]);

  const totalCurrent = useMemo(() => {
    return activeInvestments.reduce((acc, curr) => acc + curr.currentAmount, 0);
  }, [activeInvestments]);

  const portfolioPL = useMemo(() => {
    return calculateProfitLoss(totalInitial, totalCurrent);
  }, [totalInitial, totalCurrent]);

  // Allocation breakdown by type
  const typeAllocation = useMemo(() => {
    const map: Record<string, { count: number; totalCurrent: number; label: string; icon: string; barColor: string }> = {};
    activeInvestments.forEach((inv) => {
      const typeInfo = getInvestmentTypeInfo(inv.type);
      if (!map[inv.type]) {
        map[inv.type] = {
          count: 0,
          totalCurrent: 0,
          label: typeInfo.label,
          icon: typeInfo.icon,
          barColor: typeInfo.barColor,
        };
      }
      map[inv.type].count += 1;
      map[inv.type].totalCurrent += inv.currentAmount;
    });

    return Object.entries(map).map(([type, data]) => {
      const percent = totalCurrent > 0 ? (data.totalCurrent / totalCurrent) * 100 : 0;
      return {
        type: type as InvestmentType,
        ...data,
        percentage: percent,
      };
    }).sort((a, b) => b.totalCurrent - a.totalCurrent);
  }, [activeInvestments, totalCurrent]);

  // Filtered investments list
  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      const matchesType = selectedTypeFilter === 'all' || inv.type === selectedTypeFilter;
      const query = searchQuery.toLowerCase();
      const matchesQuery = 
        !searchQuery ||
        inv.name.toLowerCase().includes(query) ||
        (inv.platform && inv.platform.toLowerCase().includes(query)) ||
        (inv.notes && inv.notes.toLowerCase().includes(query));
      return matchesType && matchesQuery;
    });
  }, [investments, selectedTypeFilter, searchQuery]);

  // Handlers for Add modal
  const openAddModal = (presetType?: InvestmentType) => {
    retroSound.playClick();
    setEditingInvestment(null);
    setFormType(presetType || 'saham');
    setFormName('');
    setFormPlatform('');
    setFormBuyDate(new Date().toISOString().split('T')[0]);
    setFormInitialAmount('');
    setFormCurrentAmount('');
    setFormUnits('');
    setFormCategoryPotId(pots.find((p) => p.name.toLowerCase().includes('tabungan') || p.name.toLowerCase().includes('invest'))?.id || pots[0]?.id || '');
    setFormNotes('');
    setFormDeductCash(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (inv: Investment) => {
    retroSound.playClick();
    setEditingInvestment(inv);
    setFormType(inv.type);
    setFormName(inv.name);
    setFormPlatform(inv.platform || '');
    setFormBuyDate(inv.buyDate);
    setFormInitialAmount(inv.initialAmount.toString());
    setFormCurrentAmount(inv.currentAmount.toString());
    setFormUnits(inv.units ? inv.units.toString() : '');
    setFormCategoryPotId(inv.categoryPotId || pots[0]?.id || '');
    setFormNotes(inv.notes || '');
    setFormDeductCash(false);
    setIsAddModalOpen(true);
  };

  const openValuationModal = (inv: Investment) => {
    retroSound.playClick();
    setValuingInvestment(inv);
    setNewValuationInput(inv.currentAmount.toString());
  };

  const openSellModal = (inv: Investment) => {
    retroSound.playClick();
    setSellingInvestment(inv);
    setSellAmountInput(inv.currentAmount.toString());
    setSellTargetPotId(pots[0]?.id || '');
  };

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const initialNum = parseFloat(formInitialAmount.replace(/[^0-9]/g, ''));
    if (!formName.trim() || isNaN(initialNum) || initialNum <= 0) {
      alert('Mohon masukkan nama investasi dan modal pembelian yang valid!');
      return;
    }

    const currentNum = formCurrentAmount.trim() 
      ? parseFloat(formCurrentAmount.replace(/[^0-9]/g, '')) 
      : initialNum;

    const unitsNum = formUnits.trim() ? parseFloat(formUnits) : undefined;

    if (editingInvestment) {
      onEditInvestment({
        ...editingInvestment,
        name: formName.trim(),
        type: formType,
        platform: formPlatform.trim() || undefined,
        buyDate: formBuyDate,
        initialAmount: initialNum,
        currentAmount: isNaN(currentNum) ? initialNum : currentNum,
        units: unitsNum,
        categoryPotId: formCategoryPotId || undefined,
        notes: formNotes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      retroSound.playSuccess();
    } else {
      onAddInvestment(
        {
          name: formName.trim(),
          type: formType,
          platform: formPlatform.trim() || undefined,
          buyDate: formBuyDate,
          initialAmount: initialNum,
          currentAmount: isNaN(currentNum) ? initialNum : currentNum,
          units: unitsNum,
          categoryPotId: formCategoryPotId || undefined,
          notes: formNotes.trim() || undefined,
        },
        formDeductCash
      );
      retroSound.playCoin();
    }

    setIsAddModalOpen(false);
  };

  const handleSaveValuation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valuingInvestment) return;
    const newVal = parseFloat(newValuationInput.replace(/[^0-9]/g, ''));
    if (isNaN(newVal) || newVal < 0) {
      alert('Masukkan nilai pasar terkini yang valid!');
      return;
    }
    onUpdateCurrentValue(valuingInvestment.id, newVal);
    retroSound.playCoin();
    setValuingInvestment(null);
  };

  const handleConfirmSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingInvestment) return;
    const soldNum = parseFloat(sellAmountInput.replace(/[^0-9]/g, ''));
    if (isNaN(soldNum) || soldNum <= 0) {
      alert('Masukkan nominal hasil pencairan yang valid!');
      return;
    }
    if (onSellInvestment) {
      onSellInvestment(sellingInvestment.id, soldNum, sellTargetPotId);
    } else {
      onEditInvestment({
        ...sellingInvestment,
        status: 'sold',
        soldAmount: soldNum,
        soldDate: new Date().toISOString().split('T')[0],
        currentAmount: soldNum,
      });
    }
    retroSound.playSuccess();
    setSellingInvestment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-6 pixel-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 shrink-0 shadow-[2px_2px_0px_#000]">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base sm:text-lg text-amber-400 tracking-wide">
                  PORTOFOLIO & INPUT INVESTASI
                </h2>
                <span className="bg-indigo-600 text-white font-pixel text-[9px] px-2 py-0.5 border border-black">
                  ALL-IN-ONE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-sans-clean mt-0.5">
                Satu wadah untuk mencatat dan memantau seluruh instrumen: Saham, Emas, Obligasi, Reksadana, Kripto, Deposito, dll.
              </p>
            </div>
          </div>

          <button
            onClick={() => openAddModal()}
            className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-4 py-3 border-4 border-black flex items-center justify-center gap-2 font-bold shrink-0 self-start sm:self-auto"
          >
            <PlusCircle size={18} className="text-black" />
            <span>+ INPUT INVESTASI</span>
          </button>
        </div>
      </div>

      {/* Main Portfolio Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Nilai Portofolio Saat Ini */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[10px] text-amber-400 tracking-wider">
              TOTAL NILAI SAAT INI
            </span>
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <Coins size={16} />
            </div>
          </div>
          <div className="font-pixel text-lg sm:text-xl text-white mb-1.5 tracking-tight truncate">
            {formatRupiah(totalCurrent)}
          </div>
          <div className="text-[11px] text-slate-300 font-sans-clean flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-emerald-400"></span>
            Dari {activeInvestments.length} instrumen aktif
          </div>
        </div>

        {/* Card 2: Total Modal Pembelian */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[10px] text-sky-400 tracking-wider">
              TOTAL MODAL AWAL
            </span>
            <div className="w-7 h-7 bg-sky-500/20 border border-sky-500 flex items-center justify-center text-sky-400">
              <Building2 size={16} />
            </div>
          </div>
          <div className="font-pixel text-lg sm:text-xl text-sky-300 mb-1.5 tracking-tight truncate">
            {formatRupiah(totalInitial)}
          </div>
          <div className="text-[11px] text-slate-300 font-sans-clean">
            Akumulasi modal beli yang dikeluarkan
          </div>
        </div>

        {/* Card 3: Keuntungan / Kerugian (P&L) */}
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[10px] text-slate-300 tracking-wider">
              TOTAL KEUNTUNGAN (P&L)
            </span>
            <div className={`w-7 h-7 border flex items-center justify-center ${
              portfolioPL.isProfit 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : portfolioPL.isLoss 
                ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                : 'bg-slate-700 border-slate-500 text-slate-300'
            }`}>
              {portfolioPL.isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
          </div>
          <div className={`font-pixel text-lg sm:text-xl mb-1.5 tracking-tight truncate ${portfolioPL.colorClass}`}>
            {portfolioPL.formattedDiff}
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-pixel text-[10px] px-2 py-0.5 border ${portfolioPL.badgeClass}`}>
              {portfolioPL.formattedPercent}
            </span>
            <span className="text-[11px] text-slate-400 font-sans-clean">
              {portfolioPL.isProfit ? 'Surplus Portofolio' : portfolioPL.isLoss ? 'Koreksi Nilai' : 'Break Even'}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Class Allocation Bar */}
      {typeAllocation.length > 0 && (
        <div className="bg-[#1e293b] border-4 border-black p-4 pixel-card">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-amber-400" />
              <h3 className="font-pixel text-xs text-slate-200">
                DISTRIBUSI ALOKASI ASET
              </h3>
            </div>
            <span className="text-[10px] font-pixel text-slate-400">
              {typeAllocation.length} KATEGORI
            </span>
          </div>

          {/* Multi-colored Segmented Progress Bar */}
          <div className="w-full bg-[#0f172a] h-5 border-2 border-black flex overflow-hidden p-0.5 gap-0.5">
            {typeAllocation.map((alloc) => (
              <div
                key={alloc.type}
                className={`h-full ${alloc.barColor} transition-all relative group`}
                style={{ width: `${Math.max(3, alloc.percentage)}%` }}
                title={`${alloc.label}: ${alloc.percentage.toFixed(1)}% (${formatRupiah(alloc.totalCurrent)})`}
              />
            ))}
          </div>

          {/* Legend Chips */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs font-sans-clean">
            {typeAllocation.map((alloc) => (
              <div key={alloc.type} className="flex items-center gap-1.5 bg-[#0f172a] px-2.5 py-1 border border-black">
                <span className="text-sm">{alloc.icon}</span>
                <span className="font-medium text-slate-200">{alloc.label}:</span>
                <span className="font-pixel text-[10px] text-amber-400">{alloc.percentage.toFixed(1)}%</span>
                <span className="text-slate-400 text-[10px]">({formatRupiah(alloc.totalCurrent)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
              placeholder="Cari aset, emiten, platform (BBCA, Antam, Bibit)..."
              className="w-full bg-[#0f172a] border-2 border-black pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
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

          {/* Quick Input Shortcut by Selected Type */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-pixel text-slate-400 hidden sm:inline">INPUT CEPAT:</span>
            <button
              onClick={() => openAddModal('saham')}
              className="font-pixel text-[9px] bg-[#0f172a] hover:bg-[#334155] text-indigo-300 border-2 border-black px-2 py-1.5"
            >
              + 📈 SAHAM
            </button>
            <button
              onClick={() => openAddModal('emas')}
              className="font-pixel text-[9px] bg-[#0f172a] hover:bg-[#334155] text-amber-300 border-2 border-black px-2 py-1.5"
            >
              + 🪙 EMAS
            </button>
            <button
              onClick={() => openAddModal('obligasi')}
              className="font-pixel text-[9px] bg-[#0f172a] hover:bg-[#334155] text-emerald-300 border-2 border-black px-2 py-1.5"
            >
              + 📜 OBLIGASI
            </button>
          </div>
        </div>

        {/* Filter Type Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-black/40">
          <button
            onClick={() => {
              retroSound.playClick();
              setSelectedTypeFilter('all');
            }}
            className={`font-pixel text-[10px] px-3 py-1.5 border-2 border-black transition-all ${
              selectedTypeFilter === 'all'
                ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-[#0f172a] text-slate-300 hover:text-white'
            }`}
          >
            SEMUA ({investments.length})
          </button>

          {investmentTypesList.map((item) => {
            const count = investments.filter((inv) => inv.type === item.type).length;
            const isSelected = selectedTypeFilter === item.type;
            return (
              <button
                key={item.type}
                onClick={() => {
                  retroSound.playClick();
                  setSelectedTypeFilter(item.type);
                }}
                className={`font-pixel text-[10px] px-2.5 py-1.5 border-2 border-black flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-[#0f172a] text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="text-[9px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Investments List */}
      <div className="space-y-3.5">
        {filteredInvestments.length === 0 ? (
          <div className="bg-[#1e293b] border-4 border-black p-8 text-center pixel-card">
            <div className="text-4xl mb-3">💎</div>
            <h3 className="font-pixel text-sm text-slate-200 mb-1">
              BELUM ADA INVESTASI YANG TERCATAT
            </h3>
            <p className="text-xs text-slate-400 font-sans-clean max-w-md mx-auto mb-4">
              {searchQuery || selectedTypeFilter !== 'all'
                ? 'Tidak ada investasi yang cocok dengan filter atau kata kunci pencarian.'
                : 'Mulai bangun portofolio petualangmu dengan mencatat kepemilikan saham, emas batangan, obligasi, reksadana, ataupun kripto!'}
            </p>
            <button
              onClick={() => openAddModal()}
              className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-4 py-2.5 border-4 border-black font-bold inline-flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>+ INPUT INVESTASI PERTAMA</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInvestments.map((inv) => {
              const typeInfo = getInvestmentTypeInfo(inv.type);
              const pl = calculateProfitLoss(inv.initialAmount, inv.currentAmount);
              const isSold = inv.status === 'sold';

              return (
                <div
                  key={inv.id}
                  className={`border-4 border-black p-4 pixel-card flex flex-col justify-between transition-all relative ${
                    isSold
                      ? 'bg-[#151c28] border-slate-700 opacity-80'
                      : 'bg-[#1e293b] hover:border-amber-400/80'
                  }`}
                >
                  <div>
                    {/* Top Row: Type & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-pixel text-[9px] px-2 py-0.5 border flex items-center gap-1 ${typeInfo.badgeColor}`}>
                          <span>{typeInfo.icon}</span>
                          <span>{typeInfo.label.toUpperCase()}</span>
                        </span>
                        {inv.platform && (
                          <span className="text-[11px] text-slate-400 font-sans-clean truncate max-w-[140px]">
                            • {inv.platform}
                          </span>
                        )}
                      </div>

                      {isSold ? (
                        <span className="font-pixel text-[9px] px-2 py-0.5 border-2 border-slate-500 bg-slate-800 text-slate-300">
                          SUDAH DICAIRKAN
                        </span>
                      ) : (
                        <span className={`font-pixel text-[9px] px-2 py-0.5 border ${pl.badgeClass}`}>
                          {pl.formattedPercent}
                        </span>
                      )}
                    </div>

                    {/* Asset Name */}
                    <div className="mb-3">
                      <h4 className="font-pixel text-sm text-white flex items-center gap-1.5">
                        <span>{inv.name}</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 font-sans-clean mt-0.5 flex items-center gap-3">
                        <span>Beli: {formatDateIndo(inv.buyDate)}</span>
                        {inv.units && (
                          <span>• {inv.units} {typeInfo.unitLabel}</span>
                        )}
                      </div>
                    </div>

                    {/* Financial Metrics Grid */}
                    <div className="bg-[#0f172a] border-2 border-black p-3 mb-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-pixel">MODAL AWAL</div>
                        <div className="font-pixel text-xs text-sky-300 mt-0.5 truncate">
                          {formatRupiah(inv.initialAmount)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-pixel">NILAI SAAT INI</div>
                        <div className="font-pixel text-xs text-amber-400 mt-0.5 truncate">
                          {formatRupiah(inv.currentAmount)}
                        </div>
                      </div>

                      <div className="col-span-2 pt-2 border-t border-black/50 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-sans-clean">Keuntungan / P&L:</span>
                        <div className="text-right">
                          <span className={`font-pixel text-xs ${pl.colorClass}`}>
                            {pl.formattedDiff}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {inv.notes && (
                      <p className="text-[11px] text-slate-300 font-sans-clean italic bg-[#0f172a]/50 p-2 border border-black/40 mb-3">
                        "{inv.notes}"
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/40 gap-2">
                    <div className="flex items-center gap-1.5">
                      {!isSold && (
                        <button
                          onClick={() => openValuationModal(inv)}
                          className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-amber-400 font-pixel text-[10px] px-2.5 py-1.5 border border-black flex items-center gap-1"
                          title="Perbarui harga pasar terkini"
                        >
                          <RefreshCw size={12} />
                          <span>UPDATE NILAI</span>
                        </button>
                      )}

                      {!isSold && onSellInvestment && (
                        <button
                          onClick={() => openSellModal(inv)}
                          className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-emerald-400 font-pixel text-[10px] px-2 py-1.5 border border-black"
                          title="Cairkan atau jual aset investasi"
                        >
                          CAIRKAN
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(inv)}
                        className="p-1.5 text-slate-400 hover:text-white bg-[#0f172a] border border-black hover:border-slate-500"
                        title="Edit data investasi"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus pencatatan investasi ${inv.name}?`)) {
                            retroSound.playDelete();
                            onDeleteInvestment(inv.id);
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 bg-[#0f172a] border border-black hover:border-rose-800"
                        title="Hapus aset ini"
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

      {/* MODAL: Input / Edit Investasi (The Unified Input Form) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-xl p-4 sm:p-6 pixel-modal my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💎</span>
                <h3 className="font-pixel text-sm sm:text-base text-amber-400">
                  {editingInvestment ? 'EDIT DATA INVESTASI' : 'INPUT INVESTASI BARU'}
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

            <form onSubmit={handleSaveInvestment} className="space-y-4">
              {/* 1. Pilih Jenis Investasi (The core selector requested by user) */}
              <div>
                <label className="block font-pixel text-xs text-amber-300 mb-2">
                  1. PILIH JENIS INVESTASI:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {investmentTypesList.map((item) => {
                    const isSelected = formType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          retroSound.playClick();
                          setFormType(item.type);
                        }}
                        className={`p-2 border-2 border-black flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-black font-bold shadow-[2px_2px_0px_#000]'
                            : 'bg-[#0f172a] text-slate-300 hover:bg-[#1e293b] hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-pixel text-[10px] text-center leading-tight">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 font-sans-clean mt-1.5 italic">
                  💡 Jenis terpilih: <strong>{getInvestmentTypeInfo(formType).label}</strong> ({investmentTypesList.find(t => t.type === formType)?.description})
                </p>
              </div>

              {/* 2. Nama Aset & Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                    NAMA ASET / EMITEN / KODE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={
                      formType === 'saham'
                        ? 'Contoh: BBCA / Bank Central Asia'
                        : formType === 'emas'
                        ? 'Contoh: Antam 10g / UBS 5g'
                        : formType === 'obligasi'
                        ? 'Contoh: ORI025 / Sukuk ST011'
                        : formType === 'reksadana'
                        ? 'Contoh: Sucorinvest Equity Fund'
                        : formType === 'kripto'
                        ? 'Contoh: Bitcoin (BTC)'
                        : 'Contoh: Deposito BCA 12 Bulan'
                    }
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                    PLATFORM / SEKURITAS / TOKO
                  </label>
                  <input
                    type="text"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    placeholder="Contoh: Bibit, Ajaib, Pegadaian, BCA"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 3. Modal Awal & Nilai Saat Ini */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[11px] text-sky-300 mb-1">
                    MODAL BELI / NILAI AWAL (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={formInitialAmount}
                    onChange={(e) => {
                      setFormInitialAmount(e.target.value);
                      if (!formCurrentAmount || !editingInvestment) {
                        setFormCurrentAmount(e.target.value);
                      }
                    }}
                    placeholder="Contoh: 5000000"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-sky-300 placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[11px] text-amber-300 mb-1">
                    VALUASI / NILAI SAAT INI (RP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formCurrentAmount}
                    onChange={(e) => setFormCurrentAmount(e.target.value)}
                    placeholder="Sama dengan modal beli jika baru"
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-amber-300 placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 4. Tanggal & Satuan Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                    TANGGAL PEMBELIAN
                  </label>
                  <input
                    type="date"
                    required
                    value={formBuyDate}
                    onChange={(e) => setFormBuyDate(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white font-sans-clean focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                    JUMLAH UNIT ({getInvestmentTypeInfo(formType).unitLabel.toUpperCase()})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formUnits}
                    onChange={(e) => setFormUnits(e.target.value)}
                    placeholder={formType === 'emas' ? 'Contoh: 10 (gram)' : 'Contoh: 5 (lot/unit)'}
                    className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 5. Pos Anggaran Sumber Dana & Opsi Potong Kas */}
              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  POS ANGGARAN ALOKASI
                </label>
                <select
                  value={formCategoryPotId}
                  onChange={(e) => setFormCategoryPotId(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white font-sans-clean focus:outline-none focus:border-amber-400"
                >
                  {pots.map((pot) => (
                    <option key={pot.id} value={pot.id}>
                      {pot.name} ({formatRupiah(pot.monthlyBudget)})
                    </option>
                  ))}
                </select>

                {!editingInvestment && (
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-300 font-sans-clean">
                    <input
                      type="checkbox"
                      checked={formDeductCash}
                      onChange={(e) => setFormDeductCash(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <span>Catat pengeluaran kas otomatis di pos anggaran ini</span>
                  </label>
                )}
              </div>

              {/* 6. Catatan */}
              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  CATATAN STRATEGI / TARGET (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Target hold 5 tahun, dividen reinvest, kupon cair tiap tanggal 15"
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white placeholder:text-slate-500 font-sans-clean focus:outline-none focus:border-amber-400 resize-none"
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
                  className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-5 py-2.5 border-4 border-black font-bold flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{editingInvestment ? 'SIMPAN PERUBAHAN' : 'INPUT KE PORTOFOLIO'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Quick Update Valuation */}
      {valuingInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-md p-5 pixel-modal">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-amber-400" />
                <h3 className="font-pixel text-xs sm:text-sm text-amber-400">
                  UPDATE VALUASI TERKINI
                </h3>
              </div>
              <button
                onClick={() => setValuingInvestment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveValuation} className="space-y-4">
              <div className="bg-[#0f172a] p-3 border-2 border-black text-xs font-sans-clean">
                <div className="font-pixel text-white mb-1">{valuingInvestment.name}</div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Modal Awal:</span>
                  <span className="font-pixel text-sky-300">{formatRupiah(valuingInvestment.initialAmount)}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between mt-1">
                  <span>Nilai Sebelumnya:</span>
                  <span className="font-pixel text-slate-300">{formatRupiah(valuingInvestment.currentAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block font-pixel text-xs text-amber-300 mb-1.5">
                  MASUKKAN NILAI PASAR TERBARU (RP):
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={newValuationInput}
                  onChange={(e) => setNewValuationInput(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2.5 text-sm text-amber-300 font-sans-clean font-bold focus:outline-none focus:border-amber-400"
                  placeholder="Contoh: 7500000"
                  autoFocus
                />
              </div>

              {/* Realtime P&L Preview */}
              {newValuationInput && !isNaN(parseFloat(newValuationInput)) && (
                <div className="p-2.5 bg-[#0f172a] border border-black text-xs flex items-center justify-between font-sans-clean">
                  <span className="text-slate-400">Estimasi P&L Baru:</span>
                  {(() => {
                    const previewPL = calculateProfitLoss(valuingInvestment.initialAmount, parseFloat(newValuationInput));
                    return (
                      <span className={`font-pixel text-xs ${previewPL.colorClass}`}>
                        {previewPL.formattedDiff} ({previewPL.formattedPercent})
                      </span>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
                <button
                  type="button"
                  onClick={() => setValuingInvestment(null)}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-[11px] px-3 py-2 border border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-amber-400 hover:bg-amber-300 text-black font-pixel text-[11px] px-4 py-2 border-2 border-black font-bold"
                >
                  SIMPAN VALUASI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pencairan / Jual Investasi */}
      {sellingInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1e293b] border-4 border-black w-full max-w-md p-5 pixel-modal">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <h3 className="font-pixel text-xs sm:text-sm text-emerald-400">
                  CAIRKAN / JUAL INVESTASI
                </h3>
              </div>
              <button
                onClick={() => setSellingInvestment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSell} className="space-y-4">
              <div className="bg-[#0f172a] p-3 border-2 border-black text-xs font-sans-clean">
                <div className="font-pixel text-white mb-1">{sellingInvestment.name}</div>
                <div className="text-slate-400">
                  Modal Beli: <strong className="text-sky-300">{formatRupiah(sellingInvestment.initialAmount)}</strong>
                </div>
              </div>

              <div>
                <label className="block font-pixel text-xs text-emerald-300 mb-1.5">
                  NOMINAL HASIL PENJUALAN / PENCAIRAN (RP):
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={sellAmountInput}
                  onChange={(e) => setSellAmountInput(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2.5 text-sm text-emerald-400 font-sans-clean font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-pixel text-[11px] text-slate-300 mb-1">
                  MASUKKAN DANA CAIR KE POS KAS:
                </label>
                <select
                  value={sellTargetPotId}
                  onChange={(e) => setSellTargetPotId(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black px-3 py-2 text-xs text-white font-sans-clean focus:outline-none focus:border-emerald-400"
                >
                  {pots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
                <button
                  type="button"
                  onClick={() => setSellingInvestment(null)}
                  className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-slate-300 font-pixel text-[11px] px-3 py-2 border border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[11px] px-4 py-2 border-2 border-black font-bold"
                >
                  KONFIRMASI PENCAIRAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
