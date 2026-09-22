import React, { useState } from 'react';
import { Debt, CategoryPot, DebtStatus } from '../types';
import { formatRupiah, formatDateIndo, getDebtStatusInfo } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { PixelIcon } from './PixelIcon';
import { 
  CreditCard, 
  Search, 
  Phone, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Trash2, 
  Edit3,
  Clock,
  Sparkles,
  ShieldCheck,
  History,
  ArrowUpRight
} from 'lucide-react';

interface DebtsManagerProps {
  debts: Debt[];
  pots: CategoryPot[];
  onAddDebt: (newDebt: Omit<Debt, 'id' | 'createdAt' | 'paidAmount' | 'remainingAmount' | 'status' | 'payments' | 'paidAt'>) => void;
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onRecordPayment: (debtId: string, amount: number, potId: string, date: string, note?: string) => void;
}

export const DebtsManager: React.FC<DebtsManagerProps> = ({
  debts,
  pots,
  onAddDebt,
  onEditDebt,
  onDeleteDebt,
  onRecordPayment,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [viewHistoryDebt, setViewHistoryDebt] = useState<Debt | null>(null);

  // Form state for new / edit
  const [formData, setFormData] = useState({
    creditorName: '',
    creditorContact: '',
    totalAmount: '',
    borrowedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    categoryPotId: pots[0]?.id || '',
    purpose: '',
    notes: '',
  });

  // Form state for payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [targetPotId, setTargetPotId] = useState(pots[0]?.id || '');

  // Calculate totals
  const totalOutstanding = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalBorrowed = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  
  const overdueCount = debts.filter((d) => {
    if (d.remainingAmount <= 0) return false;
    const status = getDebtStatusInfo(d.status, d.dueDate, d.remainingAmount);
    return status.label === 'JATUH TEMPO';
  }).length;

  const unpaidCount = debts.filter((d) => d.remainingAmount > 0).length;
  const paidCount = debts.filter((d) => d.remainingAmount <= 0).length;

  // Filter list
  const filteredList = debts.filter((debt) => {
    const matchSearch =
      debt.creditorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (debt.purpose && debt.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (debt.creditorContact && debt.creditorContact.includes(searchQuery));

    if (!matchSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'paid') return debt.remainingAmount <= 0;
    if (filterStatus === 'unpaid') return debt.paidAmount === 0 && debt.remainingAmount > 0;
    if (filterStatus === 'partial') return debt.paidAmount > 0 && debt.remainingAmount > 0;
    if (filterStatus === 'overdue') {
      const info = getDebtStatusInfo(debt.status, debt.dueDate, debt.remainingAmount);
      return info.label === 'JATUH TEMPO';
    }
    return true;
  });

  const openAddModal = () => {
    retroSound.playClick();
    setFormData({
      creditorName: '',
      creditorContact: '',
      totalAmount: '',
      borrowedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      categoryPotId: pots[0]?.id || '',
      purpose: '',
      notes: '',
    });
    setEditingDebt(null);
    setShowAddModal(true);
  };

  const openEditModal = (debt: Debt) => {
    retroSound.playClick();
    setFormData({
      creditorName: debt.creditorName,
      creditorContact: debt.creditorContact || '',
      totalAmount: debt.totalAmount.toString(),
      borrowedDate: debt.borrowedDate,
      dueDate: debt.dueDate,
      categoryPotId: debt.categoryPotId || pots[0]?.id || '',
      purpose: debt.purpose || '',
      notes: debt.notes || '',
    });
    setEditingDebt(debt);
    setShowAddModal(true);
  };

  const handleSubmitDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formData.totalAmount.replace(/\D/g, ''));
    if (!formData.creditorName.trim() || isNaN(amount) || amount <= 0) {
      retroSound.playWarning();
      alert('Mohon isi nama pemberi pinjaman dan nominal utang yang valid!');
      return;
    }

    if (editingDebt) {
      const newTotal = amount;
      const newRemaining = Math.max(0, newTotal - editingDebt.paidAmount);
      let newStatus: DebtStatus = 'unpaid';
      if (newRemaining <= 0) {
        newStatus = 'paid';
      } else if (editingDebt.paidAmount > 0) {
        newStatus = 'partial';
      }

      onEditDebt({
        ...editingDebt,
        creditorName: formData.creditorName.trim(),
        creditorContact: formData.creditorContact.trim(),
        totalAmount: newTotal,
        remainingAmount: newRemaining,
        status: newStatus,
        borrowedDate: formData.borrowedDate,
        dueDate: formData.dueDate,
        categoryPotId: formData.categoryPotId,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim(),
      });
      retroSound.playSuccess();
    } else {
      onAddDebt({
        creditorName: formData.creditorName.trim(),
        creditorContact: formData.creditorContact.trim(),
        totalAmount: amount,
        borrowedDate: formData.borrowedDate,
        dueDate: formData.dueDate,
        categoryPotId: formData.categoryPotId,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim(),
      });
      retroSound.playCoin();
    }

    setShowAddModal(false);
  };

  const openPaymentModal = (debt: Debt) => {
    retroSound.playClick();
    setPayingDebt(debt);
    setPaymentAmount(debt.remainingAmount.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNote(`Bayar utang ke ${debt.creditorName}`);
    setTargetPotId(debt.categoryPotId || pots[0]?.id || '');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;

    const amount = Number(paymentAmount.replace(/\D/g, ''));
    if (isNaN(amount) || amount <= 0) {
      retroSound.playWarning();
      alert('Masukkan nominal pembayaran yang valid!');
      return;
    }

    if (amount > payingDebt.remainingAmount) {
      retroSound.playWarning();
      alert(`Nominal melebihi sisa utang (${formatRupiah(payingDebt.remainingAmount)})!`);
      return;
    }

    onRecordPayment(payingDebt.id, amount, targetPotId, paymentDate, paymentNote);
    
    // If it pays off the debt completely, play victory level-up sound!
    if (amount >= payingDebt.remainingAmount) {
      retroSound.playSuccess();
    } else {
      retroSound.playCoin();
    }
    
    setPayingDebt(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-6 pixel-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/50 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-500/20 border-2 border-black flex items-center justify-center shrink-0 text-rose-400">
              <CreditCard size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base sm:text-lg text-rose-400">
                  PENCATATAN OUTSTANDING UTANG
                </h2>
                <span className="bg-rose-500 text-white font-pixel text-[9px] px-1.5 py-0.5 border border-black font-bold">
                  {unpaidCount} AKTIF
                </span>
                {paidCount > 0 && (
                  <span className="bg-emerald-500 text-black font-pixel text-[9px] px-1.5 py-0.5 border border-black font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>{paidCount} TERBAYAR</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-sans-clean mt-0.5">
                Pantau pinjaman yang harus kamu kembalikan, rekam cicilan, dan lihat tanda lunas saat utang sudah terbayar.
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs px-4 py-3 border-4 border-black flex items-center justify-center gap-2 font-bold shadow-[2px_2px_0px_#000]"
          >
            <CreditCard size={16} />
            <span>+ CATAT UTANG BARU</span>
          </button>
        </div>

        {/* 3 Metric Cards for Debts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0f172a] border-2 border-black p-3.5">
          <div>
            <div className="text-[10px] font-pixel text-rose-400">OUTSTANDING UTANG (BELUM LUNAS)</div>
            <div className="font-pixel text-base sm:text-lg text-rose-400 mt-1">
              {formatRupiah(totalOutstanding)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              {unpaidCount} kewajiban aktif masih perlu dibayar
            </div>
          </div>

          <div>
            <div className="text-[10px] font-pixel text-emerald-400 flex items-center gap-1">
              <span>SUDAH TERBAYAR (LUNAS)</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1">✓ LUNAS</span>
            </div>
            <div className="font-pixel text-base sm:text-lg text-emerald-400 mt-1">
              {formatRupiah(totalPaid)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              {paidCount} utang telah selesai dibayar lunas
            </div>
          </div>

          <div>
            <div className="text-[10px] font-pixel text-amber-400">TOTAL AKUMULASI UTANG</div>
            <div className="font-pixel text-base sm:text-lg text-slate-100 mt-1">
              {formatRupiah(totalBorrowed)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-0.5">
              {overdueCount > 0 ? (
                <span className="text-rose-400 font-bold">⚠️ {overdueCount} utang lewat jatuh tempo!</span>
              ) : (
                'Semua jadwal pembayaran terkontrol aman'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1e293b] border-4 border-black p-3 sm:p-4 pixel-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: 'all', label: 'SEMUA', count: debts.length },
            { id: 'unpaid', label: 'BELUM BAYAR', count: debts.filter((d) => d.paidAmount === 0 && d.remainingAmount > 0).length },
            { id: 'partial', label: 'DICICIL', count: debts.filter((d) => d.paidAmount > 0 && d.remainingAmount > 0).length },
            { id: 'overdue', label: 'JATUH TEMPO', count: overdueCount },
            { 
              id: 'paid', 
              label: '✓ SUDAH TERBAYAR', 
              count: paidCount,
              highlight: true 
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                retroSound.playClick();
                setFilterStatus(tab.id);
              }}
              className={`font-pixel text-[10px] px-2.5 py-1.5 border-2 border-black transition-all flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? tab.highlight 
                    ? 'bg-emerald-500 text-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-[#f59e0b] text-black font-bold shadow-[2px_2px_0px_#000]'
                  : tab.highlight
                    ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border-emerald-800'
                    : 'bg-[#0f172a] text-slate-300 hover:bg-[#334155]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[8px] px-1 border border-black ${
                filterStatus === tab.id ? 'bg-black text-white' : 'bg-[#1e293b] text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari kreditur / keperluan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border-2 border-black pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-sans-clean focus:outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-[#1e293b] border-4 border-black p-8 text-center pixel-card">
            <div className="text-4xl mb-3">🛡️</div>
            <p className="font-pixel text-xs text-slate-300 mb-1">TIDAK ADA DATA UTANG</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 font-sans-clean">
              {filterStatus === 'paid' 
                ? 'Belum ada utang dengan status sudah terbayar lunas.' 
                : 'Tidak ada utang yang cocok dengan filter pencarian Anda.'}
            </p>
            <button
              onClick={openAddModal}
              className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs px-4 py-2 border-2 border-black font-bold"
            >
              + CATAT UTANG BARU
            </button>
          </div>
        ) : (
          filteredList.map((debt) => {
            const statusInfo = getDebtStatusInfo(debt.status, debt.dueDate, debt.remainingAmount);
            const isFullyPaid = debt.remainingAmount <= 0;
            const progressPercent = debt.totalAmount > 0 ? Math.min(100, Math.round((debt.paidAmount / debt.totalAmount) * 100)) : 0;
            const relatedPot = pots.find((p) => p.id === debt.categoryPotId);

            return (
              <div
                key={debt.id}
                className={`border-4 border-black p-4 sm:p-5 pixel-card relative transition-all ${
                  isFullyPaid 
                    ? 'bg-[#0f241d]/90 border-emerald-600/90 shadow-[3px_3px_0px_#064e3b]' 
                    : 'bg-[#1e293b]'
                }`}
              >
                {/* BIG RETRO STAMP WHEN DEBT IS FULLY PAID */}
                {isFullyPaid && (
                  <div className="absolute top-3 right-3 sm:right-6 pointer-events-none z-10">
                    <div className="border-4 border-emerald-400 bg-emerald-950/90 px-3 sm:px-4 py-1.5 font-pixel text-[11px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider rotate-[-4deg] shadow-[3px_3px_0px_#000] flex items-center gap-2">
                      <span className="text-base sm:text-lg">👑</span>
                      <div className="text-left leading-tight">
                        <div className="text-emerald-300">SUDAH TERBAYAR</div>
                        <div className="text-[8px] text-emerald-400 font-sans-clean font-bold tracking-normal">
                          BEBAS TANGGUNGAN ✓
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Creditor info & Status */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-pixel text-sm sm:text-base ${isFullyPaid ? 'text-emerald-300 line-through decoration-emerald-500/60' : 'text-slate-100'}`}>
                        {debt.creditorName}
                      </h3>

                      {/* Status Badge */}
                      <span className={`font-pixel text-[9px] px-2 py-0.5 border ${statusInfo.color} flex items-center gap-1`}>
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </span>

                      {relatedPot && (
                        <span className="bg-[#0f172a] text-slate-300 border border-slate-700 text-[10px] font-sans-clean px-2 py-0.5 flex items-center gap-1">
                          <PixelIcon name={relatedPot.icon} size={12} />
                          <span>{relatedPot.name}</span>
                        </span>
                      )}
                    </div>

                    {/* Purpose and Notes */}
                    {debt.purpose && (
                      <p className="text-xs sm:text-sm text-slate-300 font-sans-clean">
                        {debt.purpose}
                      </p>
                    )}

                    {/* Meta info: dates & contact */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400 font-sans-clean">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-500" />
                        <span>Dipinjam: {formatDateIndo(debt.borrowedDate)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock size={13} className={statusInfo.label === 'JATUH TEMPO' ? 'text-rose-400 font-bold' : 'text-slate-500'} />
                        <span className={statusInfo.label === 'JATUH TEMPO' ? 'text-rose-400 font-bold' : ''}>
                          Tenggat: {formatDateIndo(debt.dueDate)}
                        </span>
                      </div>

                      {debt.creditorContact && (
                        <div className="flex items-center gap-1 text-slate-300">
                          <Phone size={13} className="text-slate-500" />
                          <span>{debt.creditorContact}</span>
                        </div>
                      )}

                      {isFullyPaid && debt.paidAt && (
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Sparkles size={13} />
                          <span>Lunas pada: {formatDateIndo(debt.paidAt.split('T')[0])}</span>
                        </div>
                      )}
                    </div>

                    {debt.notes && (
                      <div className="text-[11px] text-slate-400 font-sans-clean bg-[#0f172a] p-2 border border-black/40 italic">
                        &ldquo;{debt.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Right Column: Financial amounts and progress */}
                  <div className="w-full lg:w-72 shrink-0 bg-[#0f172a] border-2 border-black p-3 space-y-2.5">
                    {/* Amount numbers */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-pixel text-slate-400">SISA TANGGUNGAN</span>
                      <span className={`font-pixel text-sm sm:text-base font-bold ${isFullyPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatRupiah(debt.remainingAmount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-sans-clean text-slate-400 mb-1">
                        <span>Sudah Dibayar: <strong className="text-emerald-400">{formatRupiah(debt.paidAmount)}</strong></span>
                        <span className="font-pixel text-[9px]">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[#1e293b] h-3 border border-black p-0.5 pixel-progress-track">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFullyPaid ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 font-sans-clean mt-0.5">
                        <span>Total: {formatRupiah(debt.totalAmount)}</span>
                        {isFullyPaid ? (
                          <span className="text-emerald-400 font-bold font-pixel">LUNAS BERSIH</span>
                        ) : (
                          <span>Sisa: {formatRupiah(debt.remainingAmount)}</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewHistoryDebt(debt)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 bg-[#1e293b] border border-black"
                          title="Lihat riwayat cicilan/pembayaran"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(debt)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 bg-[#1e293b] border border-black"
                          title="Edit Utang"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan utang ke '${debt.creditorName}'?`)) {
                              retroSound.playDelete();
                              onDeleteDebt(debt.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#1e293b] border border-black"
                          title="Hapus Utang"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {!isFullyPaid ? (
                        <button
                          onClick={() => openPaymentModal(debt)}
                          className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[10px] px-3 py-1.5 border border-black font-bold flex items-center gap-1"
                        >
                          <DollarSign size={13} />
                          <span>BAYAR UTANG</span>
                        </button>
                      ) : (
                        <span className="font-pixel text-[9px] text-emerald-400 bg-emerald-950 px-2 py-1 border border-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={11} />
                          <span>SUDAH TERBAYAR</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Tambah / Edit Utang */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-lg w-full pixel-card relative my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <h3 className="font-pixel text-sm text-rose-400">
                  {editingDebt ? 'EDIT CATATAN UTANG' : 'CATAT UTANG / PINJAMAN BARU'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDebt} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  NAMA PEMBERI PINJAMAN (KREDITUR) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toko Elektronik, Mas Hendra, Bank BCA"
                  value={formData.creditorName}
                  onChange={(e) => setFormData({ ...formData, creditorName: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-pixel text-rose-400 mb-1">
                    TOTAL NOMINAL UTANG (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="1000000"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-amber-300 font-pixel focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    NO. HP / KONTAK (OPSIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={formData.creditorContact}
                    onChange={(e) => setFormData({ ...formData, creditorContact: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    TANGGAL MEMINJAM *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.borrowedDate}
                    onChange={(e) => setFormData({ ...formData, borrowedDate: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    JATUH TEMPO (TENGGAT) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  POS ANGGARAN ALOKASI PENGELUARAN
                </label>
                <select
                  value={formData.categoryPotId}
                  onChange={(e) => setFormData({ ...formData, categoryPotId: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-rose-400 focus:outline-none"
                >
                  {pots.map((pot) => (
                    <option key={pot.id} value={pot.id}>
                      {pot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  KEPERLUAN / TUJUAN UTANG
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Talangan servis motor, Beli laptop kerja, DP rumah"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  CATATAN TAMBAHAN (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  placeholder="Perjanjian cicilan, no. rekening tujuan transfer, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold"
                >
                  {editingDebt ? 'SIMPAN PERUBAHAN' : 'CATAT UTANG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Catat Pembayaran / Pelunasan Utang */}
      {payingDebt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm text-emerald-400">
                    CATAT PEMBAYARAN UTANG
                  </h3>
                  <p className="text-[10px] text-slate-400 font-pixel">
                    Ke: {payingDebt.creditorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayingDebt(null)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick Sisa Info Banner */}
            <div className="bg-[#0f172a] border-2 border-black p-3 mb-4 flex items-center justify-between">
              <div>
                <div className="text-[9px] font-pixel text-slate-400">SISA TANGGUNGAN UTANG</div>
                <div className="font-pixel text-base text-rose-400">
                  {formatRupiah(payingDebt.remainingAmount)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentAmount(payingDebt.remainingAmount.toString())}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[9px] px-2.5 py-1.5 border border-black font-bold"
              >
                LUNASI PENUH (100%)
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-pixel text-emerald-400 mb-1">
                  NOMINAL PEMBAYARAN (RP) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={payingDebt.remainingAmount}
                  step="1000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-base text-emerald-300 font-pixel focus:border-emerald-400 focus:outline-none"
                />
                {Number(paymentAmount) >= payingDebt.remainingAmount && (
                  <div className="mt-1 text-[10px] font-pixel text-emerald-400 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>Utang akan langsung berstatus SUDAH TERBAYAR LUNAS!</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  SUMBER POS PENGELUARAN
                </label>
                <select
                  value={targetPotId}
                  onChange={(e) => setTargetPotId(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-emerald-400 focus:outline-none"
                >
                  {pots.map((pot) => (
                    <option key={pot.id} value={pot.id}>
                      {pot.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-sans-clean mt-1">
                  Otomatis mencatat transaksi pengeluaran (Damage Kas) di pos terpilih.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  TANGGAL PEMBAYARAN
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  CATATAN PEMBAYARAN (OPSIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer Mandiri, Cicilan ke-2, Cash di kantor"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setPayingDebt(null)}
                  className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>SIMPAN PEMBAYARAN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Riwayat Pembayaran / Cicilan */}
      {viewHistoryDebt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm text-amber-400">
                    RIWAYAT PEMBAYARAN UTANG
                  </h3>
                  <p className="text-[10px] text-slate-400 font-pixel">
                    Kreditur: {viewHistoryDebt.creditorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewHistoryDebt(null)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-[#0f172a] border-2 border-black p-3 mb-4 space-y-1">
              <div className="flex justify-between text-xs font-sans-clean text-slate-300">
                <span>Total Pinjaman:</span>
                <span className="font-pixel text-xs text-white">{formatRupiah(viewHistoryDebt.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-sans-clean text-slate-300">
                <span>Sudah Terbayar:</span>
                <span className="font-pixel text-xs text-emerald-400">{formatRupiah(viewHistoryDebt.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-sans-clean text-slate-300">
                <span>Sisa Tanggungan:</span>
                <span className={`font-pixel text-xs ${viewHistoryDebt.remainingAmount <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatRupiah(viewHistoryDebt.remainingAmount)}
                </span>
              </div>

              {viewHistoryDebt.remainingAmount <= 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-center">
                  <span className="font-pixel text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-700 font-bold inline-block">
                    ✓ SUDAH TERBAYAR LUNAS (SELESAI)
                  </span>
                </div>
              )}
            </div>

            {/* Payments List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(!viewHistoryDebt.payments || viewHistoryDebt.payments.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs font-sans-clean">
                  Belum ada catatan cicilan atau pembayaran untuk utang ini.
                </div>
              ) : (
                viewHistoryDebt.payments.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="bg-[#0f172a] border border-black p-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-pixel text-emerald-400 text-[11px]">
                        +{formatRupiah(p.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans-clean">
                        {p.note || 'Pembayaran cicilan'}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans-clean text-right">
                      {formatDateIndo(p.date)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-700 mt-4 text-right">
              <button
                type="button"
                onClick={() => setViewHistoryDebt(null)}
                className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 border-2 border-black font-bold"
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
