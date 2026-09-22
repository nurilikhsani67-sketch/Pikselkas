import React, { useState } from 'react';
import { Transaction, CategoryPot, TransactionType } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { PixelIcon } from './PixelIcon';
import { 
  PlusCircle, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar 
} from 'lucide-react';

interface TransactionsManagerProps {
  transactions: Transaction[];
  pots: CategoryPot[];
  onAddTransaction: (trx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onEditTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  preselectedPotId?: string;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  pots,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  preselectedPotId,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPot, setFilterPot] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(isAddModalOpen);
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);

  // Form state
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryPotId, setCategoryPotId] = useState(preselectedPotId || pots[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Sync external modal state if triggered from outside
  React.useEffect(() => {
    if (isAddModalOpen) {
      setEditingTrx(null);
      setType('expense');
      setAmount('');
      if (preselectedPotId) {
        setCategoryPotId(preselectedPotId);
      } else if (pots[0]) {
        setCategoryPotId(pots[0].id);
      }
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setShowModal(true);
    }
  }, [isAddModalOpen, preselectedPotId, pots]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filtered list
  const filteredTransactions = transactions
    .filter((trx) => {
      if (filterType !== 'all' && trx.type !== filterType) return false;
      if (filterPot !== 'all' && trx.categoryPotId !== filterPot) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = trx.title.toLowerCase().includes(query);
        const matchNote = trx.note && trx.note.toLowerCase().includes(query);
        return matchTitle || matchNote;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openCreateModal = (defaultType: TransactionType = 'expense') => {
    retroSound.playClick();
    setEditingTrx(null);
    setType(defaultType);
    setAmount('');
    if (preselectedPotId) {
      setCategoryPotId(preselectedPotId);
    } else if (pots[0]) {
      setCategoryPotId(pots[0].id);
    }
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setShowModal(true);
  };

  const openEditModal = (trx: Transaction) => {
    retroSound.playClick();
    setEditingTrx(trx);
    setType(trx.type);
    setAmount(trx.amount.toString());
    setCategoryPotId(trx.categoryPotId);
    setTitle(trx.title);
    setDate(trx.date);
    setNote(trx.note || '');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount.replace(/\D/g, ''));
    if (!title.trim() || isNaN(amountNum) || amountNum <= 0) {
      retroSound.playWarning();
      alert('Mohon isi judul dan nominal transaksi yang valid!');
      return;
    }

    if (editingTrx) {
      onEditTransaction({
        ...editingTrx,
        type,
        amount: amountNum,
        categoryPotId,
        title: title.trim(),
        date,
        note: note.trim(),
      });
      retroSound.playSuccess();
    } else {
      onAddTransaction({
        type,
        amount: amountNum,
        categoryPotId,
        title: title.trim(),
        date,
        note: note.trim(),
      });
      if (type === 'income') {
        retroSound.playCoin();
      } else {
        retroSound.playClick();
      }
    }

    handleClose();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-6 pixel-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/50 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 border-2 border-black flex items-center justify-center shrink-0">
              <PixelIcon name="coin" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base sm:text-lg text-[#f59e0b]">
                  PENCATATAN KEUANGAN
                </h2>
                <span className="bg-emerald-500 text-black font-pixel text-[9px] px-1.5 py-0.5 border border-black font-bold">
                  {transactions.length} CATATAN
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans-clean mt-0.5">
                Kelola aliran uang masuk dan keluar secara rinci dan teratur.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => openCreateModal('income')}
              className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-3.5 py-2.5 border-4 border-black flex items-center gap-1.5 font-bold"
            >
              <ArrowDownLeft size={16} />
              <span>+ PEMASUKAN</span>
            </button>
            <button
              onClick={() => openCreateModal('expense')}
              className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs px-3.5 py-2.5 border-4 border-black flex items-center gap-1.5 font-bold"
            >
              <ArrowUpRight size={16} />
              <span>+ PENGELUARAN</span>
            </button>
          </div>
        </div>

        {/* Financial Flow Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0f172a] border-2 border-black p-3.5">
          <div>
            <div className="text-[10px] font-pixel text-emerald-400">TOTAL PEMASUKAN (+)</div>
            <div className="font-pixel text-sm sm:text-base text-emerald-400 mt-1">
              +{formatRupiah(totalIncome)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              Gaji, freelance, hasil pelunasan piutang
            </div>
          </div>

          <div>
            <div className="text-[10px] font-pixel text-rose-400">TOTAL PENGELUARAN (-)</div>
            <div className="font-pixel text-sm sm:text-base text-rose-400 mt-1">
              -{formatRupiah(totalExpense)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              Konsumsi, tagihan, transportasi, dll.
            </div>
          </div>

          <div>
            <div className="text-[10px] font-pixel text-amber-400">ARUS KAS BERSIH (NET)</div>
            <div className={`font-pixel text-sm sm:text-base mt-1 ${netBalance >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatRupiah(netBalance)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              {netBalance >= 0 ? 'Surplus kas terjaga' : 'Defisit (pengeluaran > pemasukan)'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#1e293b] border-4 border-black p-3 sm:p-4 pixel-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Type & Pot Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {[
              { id: 'all', label: 'SEMUA' },
              { id: 'income', label: 'PEMASUKAN' },
              { id: 'expense', label: 'PENGELUARAN' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  retroSound.playClick();
                  setFilterType(tab.id);
                }}
                className={`font-pixel text-[10px] px-2.5 py-1.5 border-2 border-black transition-all ${
                  filterType === tab.id
                    ? 'bg-[#f59e0b] text-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-[#0f172a] text-slate-300 hover:bg-[#334155]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter by Pot */}
          <select
            value={filterPot}
            onChange={(e) => setFilterPot(e.target.value)}
            className="bg-[#0f172a] border-2 border-black px-2.5 py-1.5 text-xs text-slate-200 font-sans-clean focus:outline-none"
          >
            <option value="all">Semua Pos Anggaran</option>
            {pots.map((pot) => (
              <option key={pot.id} value={pot.id}>
                {pot.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border-2 border-black pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-sans-clean focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-sans-clean">
            <div className="text-4xl mb-3">🪙</div>
            <p className="font-pixel text-xs text-slate-300 mb-1">TIDAK ADA TRANSAKSI DITEMUKAN</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Belum ada data yang cocok dengan kriteria pencarian Anda.
            </p>
            <button
              onClick={() => openCreateModal('expense')}
              className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 border-2 border-black font-bold"
            >
              + CATAT TRANSAKSI BARU
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTransactions.map((trx) => {
              const pot = pots.find((p) => p.id === trx.categoryPotId);
              const isIncome = trx.type === 'income';

              return (
                <div
                  key={trx.id}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#0f172a]/60 px-2 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100 font-sans-clean">
                          {trx.title}
                        </span>
                        {pot && (
                          <span className="bg-[#0f172a] text-amber-300 border border-slate-700 font-pixel text-[8px] px-1.5 py-0.5 flex items-center gap-1">
                            <PixelIcon name={pot.icon} size={12} />
                            <span>{pot.name}</span>
                          </span>
                        )}
                        {trx.receivableId && (
                          <span className="text-[8px] font-pixel text-sky-400 bg-sky-950 px-1.5 py-0.5 border border-sky-800">
                            PELUNASAN PIUTANG
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-sans-clean mt-0.5 flex items-center gap-2">
                        <span>{formatDateIndo(trx.date)}</span>
                        {trx.note && <span className="truncate max-w-[200px] sm:max-w-md">• {trx.note}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div
                        className={`font-pixel text-xs sm:text-sm font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(trx.amount)}
                      </div>
                      <div className="text-[9px] font-pixel text-slate-500 uppercase">
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(trx)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 bg-[#0f172a] border border-black"
                        title="Edit Transaksi"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus transaksi '${trx.title}'?`)) {
                            retroSound.playDelete();
                            onDeleteTransaction(trx.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#0f172a] border border-black"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Tambah / Edit Transaksi */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{type === 'income' ? '📈' : '📉'}</span>
                <h3 className="font-pixel text-sm text-[#f59e0b]">
                  {editingTrx ? 'EDIT TRANSAKSI' : 'CATAT TRANSAKSI BARU'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1.5">
                  JENIS TRANSAKSI *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`font-pixel text-xs py-2.5 border-2 border-black flex items-center justify-center gap-2 ${
                      type === 'expense'
                        ? 'bg-rose-600 text-white font-bold shadow-[2px_2px_0px_#000]'
                        : 'bg-[#0f172a] text-slate-400 hover:bg-[#334155]'
                    }`}
                  >
                    <ArrowUpRight size={16} />
                    <span>PENGELUARAN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`font-pixel text-xs py-2.5 border-2 border-black flex items-center justify-center gap-2 ${
                      type === 'income'
                        ? 'bg-emerald-600 text-black font-bold shadow-[2px_2px_0px_#000]'
                        : 'bg-[#0f172a] text-slate-400 hover:bg-[#334155]'
                    }`}
                  >
                    <ArrowDownLeft size={16} />
                    <span>PEMASUKAN</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-pixel text-amber-400 mb-1">
                  NOMINAL (RP) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-base text-amber-300 font-pixel focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  JUDUL / NAMA TRANSAKSI *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Makan siang, Belanja mingguan, Gaji"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Category Pot */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  POS KEUANGAN *
                </label>
                <select
                  value={categoryPotId}
                  onChange={(e) => setCategoryPotId(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-amber-400 focus:outline-none"
                >
                  {pots.map((pot) => (
                    <option key={pot.id} value={pot.id}>
                      {pot.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  TANGGAL
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  CATATAN TAMBAHAN (OPSIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Catatan belanja, invoice, warung, dll."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold"
                >
                  {editingTrx ? 'SIMPAN PERUBAHAN' : 'CATAT SEKARANG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
