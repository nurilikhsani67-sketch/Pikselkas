import React, { useState } from 'react';
import { CategoryPot, Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { PixelIcon, PixelIconType } from './PixelIcon';
import { PlusCircle, Edit3, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface FinancialPotsManagerProps {
  pots: CategoryPot[];
  transactions: Transaction[];
  onAddPot: (pot: Omit<CategoryPot, 'id'>) => void;
  onEditPot: (pot: CategoryPot) => void;
  onDeletePot: (id: string) => void;
  onQuickExpenseForPot: (potId: string) => void;
}

const AVAILABLE_ICONS: Array<{ key: CategoryPot['icon']; label: string }> = [
  { key: 'food', label: 'Makanan / Dapur' },
  { key: 'game', label: 'Hiburan / Game' },
  { key: 'chest', label: 'Tabungan / Emas' },
  { key: 'potion', label: 'Kesehatan / Medis' },
  { key: 'sword', label: 'Transportasi / Bensin' },
  { key: 'shield', label: 'Dana Darurat' },
  { key: 'sparkle', label: 'Tagihan / Listrik' },
  { key: 'house', label: 'Rumah & Sewa' },
  { key: 'scroll', label: 'Pendidikan & Kursus' },
  { key: 'heart', label: 'Keluarga & Donasi' },
];

const AVAILABLE_COLORS: Array<{ key: CategoryPot['color']; label: string; bg: string }> = [
  { key: 'emerald', label: 'Hijau Zamrud', bg: 'bg-emerald-500' },
  { key: 'amber', label: 'Kuning Emas', bg: 'bg-amber-400' },
  { key: 'sky', label: 'Biru Langit', bg: 'bg-sky-400' },
  { key: 'rose', label: 'Merah Ruby', bg: 'bg-rose-500' },
  { key: 'purple', label: 'Ungu Mistis', bg: 'bg-purple-500' },
  { key: 'orange', label: 'Oranye Senja', bg: 'bg-orange-500' },
  { key: 'teal', label: 'Hijau Laut', bg: 'bg-teal-400' },
];

export const FinancialPotsManager: React.FC<FinancialPotsManagerProps> = ({
  pots,
  transactions,
  onAddPot,
  onEditPot,
  onDeletePot,
  onQuickExpenseForPot,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPot, setEditingPot] = useState<CategoryPot | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<CategoryPot['icon']>('food');
  const [color, setColor] = useState<CategoryPot['color']>('emerald');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [description, setDescription] = useState('');

  // Total allocated budget across all pots
  const totalAllocatedBudget = pots.reduce((sum, p) => sum + p.monthlyBudget, 0);

  // Total spent across all expense transactions this month
  const totalSpentAll = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const openCreateModal = () => {
    retroSound.playClick();
    setEditingPot(null);
    setName('');
    setIcon('food');
    setColor('emerald');
    setMonthlyBudget('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (pot: CategoryPot) => {
    retroSound.playClick();
    setEditingPot(pot);
    setName(pot.name);
    setIcon(pot.icon);
    setColor(pot.color);
    setMonthlyBudget(pot.monthlyBudget.toString());
    setDescription(pot.description || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = Number(monthlyBudget.replace(/\D/g, ''));
    if (!name.trim() || isNaN(budgetNum) || budgetNum < 0) {
      retroSound.playWarning();
      alert('Mohon isi nama pos dan target budget bulanan yang valid!');
      return;
    }

    if (editingPot) {
      onEditPot({
        ...editingPot,
        name: name.trim(),
        icon,
        color,
        monthlyBudget: budgetNum,
        description: description.trim(),
      });
      retroSound.playSuccess();
    } else {
      onAddPot({
        name: name.trim(),
        icon,
        color,
        monthlyBudget: budgetNum,
        description: description.trim(),
      });
      retroSound.playSuccess();
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-6 pixel-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/50 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 border-2 border-black flex items-center justify-center shrink-0">
              <PixelIcon name="chest" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base sm:text-lg text-[#f59e0b]">
                  POS-POS KEUANGAN & ANGGARAN
                </h2>
                <span className="bg-emerald-500 text-black font-pixel text-[9px] px-1.5 py-0.5 border border-black font-bold">
                  {pots.length} POS
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans-clean mt-0.5">
                Bagi penghasilanmu ke dalam kantong-kantong (envelopes) agar pengeluaran selalu terukur.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-4 py-3 border-4 border-black flex items-center justify-center gap-2 font-bold shrink-0"
          >
            <PlusCircle size={18} className="text-black" />
            <span>+ BUAT POS BARU</span>
          </button>
        </div>

        {/* Global Budget Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0f172a] border-2 border-black p-3.5">
          <div>
            <div className="text-[10px] font-pixel text-amber-400">TOTAL KUOTA DIALOKASIKAN</div>
            <div className="font-pixel text-sm sm:text-base text-white mt-1">
              {formatRupiah(totalAllocatedBudget)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              Dari {pots.length} pos anggaran aktif
            </div>
          </div>

          <div>
            <div className="text-[10px] font-pixel text-rose-400">TOTAL PENGELUARAN BULAN INI</div>
            <div className="font-pixel text-sm sm:text-base text-rose-400 mt-1">
              {formatRupiah(totalSpentAll)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              Tercatat dari semua pos
            </div>
          </div>

          <div>
            <div className="text-[10px] font-pixel text-emerald-400">SISA AMAN KESELURUHAN</div>
            <div className="font-pixel text-sm sm:text-base text-emerald-400 mt-1">
              {formatRupiah(Math.max(0, totalAllocatedBudget - totalSpentAll))}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              {totalSpentAll > totalAllocatedBudget ? '⚠️ Melebihi total target budget!' : 'Dalam batas aman pengeluaran'}
            </div>
          </div>
        </div>
      </div>

      {/* Pots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pots.map((pot) => {
          // Calculate expenses in this pot
          const potExpenses = transactions
            .filter((t) => t.type === 'expense' && t.categoryPotId === pot.id)
            .reduce((sum, t) => sum + t.amount, 0);

          const percent = pot.monthlyBudget > 0 ? Math.min(100, Math.round((potExpenses / pot.monthlyBudget) * 100)) : 0;
          const isOverbudget = potExpenses > pot.monthlyBudget;
          const remainingBudget = Math.max(0, pot.monthlyBudget - potExpenses);

          return (
            <div
              key={pot.id}
              className={`bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card relative flex flex-col justify-between ${
                isOverbudget ? 'border-rose-500 bg-rose-950/20' : ''
              }`}
            >
              <div>
                {/* Header: Icon, Name & Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-[#0f172a] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                      <PixelIcon name={pot.icon} size={22} />
                    </div>
                    <div>
                      <h4 className="font-pixel text-xs sm:text-sm text-white">
                        {pot.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-sans-clean line-clamp-1">
                        {pot.description || 'Pos pengeluaran terencana'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(pot)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 bg-[#0f172a] border border-black"
                      title="Edit Pos"
                    >
                      <Edit3 size={13} />
                    </button>
                    {pots.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus pos '${pot.name}'?`)) {
                            retroSound.playDelete();
                            onDeletePot(pot.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#0f172a] border border-black"
                        title="Hapus Pos"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress HP / Budget Bar */}
                <div className="bg-[#0f172a] border-2 border-black p-3 my-3">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-pixel">
                    <span className="text-[10px] text-slate-400">STATUS PEMAKAIAN</span>
                    <span
                      className={`text-[10px] ${
                        isOverbudget ? 'text-rose-400 font-bold animate-pulse' : percent > 80 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {isOverbudget ? 'OVERBUDGET!' : `${percent}%`}
                    </span>
                  </div>

                  <div className="w-full bg-[#1e293b] h-3.5 border border-black p-0.5 pixel-progress-track">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverbudget ? 'bg-rose-500' : percent > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-sans-clean mt-2.5 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400">Terpakai:</span>
                      <div className="font-pixel text-xs text-rose-300 mt-0.5">
                        {formatRupiah(potExpenses)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Target Kuota:</span>
                      <div className="font-pixel text-xs text-slate-200 mt-0.5">
                        {formatRupiah(pot.monthlyBudget)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remaining Notice */}
                <div className="flex items-center justify-between text-xs text-slate-300 font-sans-clean px-1 mb-2">
                  <span>Sisa kuota aman:</span>
                  <span className={`font-bold ${isOverbudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isOverbudget ? `Minus ${formatRupiah(potExpenses - pot.monthlyBudget)}` : formatRupiah(remainingBudget)}
                  </span>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => {
                  retroSound.playClick();
                  onQuickExpenseForPot(pot.id);
                }}
                className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] border-2 border-black text-amber-400 hover:text-white font-pixel text-[10px] py-2 w-full mt-2 flex items-center justify-center gap-1.5"
              >
                <span>+ CATAT PENGELUARAN DI POS INI</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: Buat / Edit Pos Keuangan */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏺</span>
                <h3 className="font-pixel text-sm text-[#f59e0b]">
                  {editingPot ? 'EDIT POS KEUANGAN' : 'BUAT POS KEUANGAN BARU'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  NAMA POS KEUANGAN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kebutuhan Pokok, Jajan, Tabungan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-amber-400 mb-1">
                  TARGET KUOTA BUDGET BULANAN (RP) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  placeholder="1500000"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-amber-300 font-pixel focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-2">
                  PILIH IKON PIXEL
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setIcon(item.key)}
                      className={`p-2 border-2 border-black flex flex-col items-center justify-center transition-all ${
                        icon === item.key
                          ? 'bg-[#f59e0b] shadow-[2px_2px_0px_#000]'
                          : 'bg-[#0f172a] hover:bg-[#334155]'
                      }`}
                      title={item.label}
                    >
                      <PixelIcon name={item.key} size={20} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-2">
                  PILIH TEMA WARNA
                </label>
                <div className="flex gap-2">
                  {AVAILABLE_COLORS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setColor(item.key)}
                      className={`w-7 h-7 border-2 border-black ${item.bg} transition-all ${
                        color === item.key ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  DESKRIPSI POS (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Digunakan untuk makan harian dan belanja dapur"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold"
                >
                  {editingPot ? 'SIMPAN POS' : 'BUAT POS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
