import React, { useState } from 'react';
import { Receivable, CategoryPot, ReceivableStatus } from '../types';
import { formatRupiah, formatDateIndo, getReceivableStatusInfo } from '../utils/formatters';
import { retroSound } from '../utils/sound';
import { PixelIcon } from './PixelIcon';
import { 
  UserPlus, 
  Search, 
  Phone, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  DollarSign, 
  Trash2, 
  Edit3,
  Clock
} from 'lucide-react';

interface ReceivablesManagerProps {
  receivables: Receivable[];
  pots: CategoryPot[];
  onAddReceivable: (newRec: Omit<Receivable, 'id' | 'createdAt' | 'paidAmount' | 'remainingAmount' | 'status' | 'payments'>) => void;
  onEditReceivable: (rec: Receivable) => void;
  onDeleteReceivable: (id: string) => void;
  onRecordPayment: (receivableId: string, amount: number, potId: string, date: string, note?: string) => void;
}

export const ReceivablesManager: React.FC<ReceivablesManagerProps> = ({
  receivables,
  pots,
  onAddReceivable,
  onEditReceivable,
  onDeleteReceivable,
  onRecordPayment,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRec, setEditingRec] = useState<Receivable | null>(null);
  const [payingRec, setPayingRec] = useState<Receivable | null>(null);
  const [reminderRec, setReminderRec] = useState<Receivable | null>(null);
  const [viewHistoryRec, setViewHistoryRec] = useState<Receivable | null>(null);

  // Form state for new / edit
  const [formData, setFormData] = useState({
    debtorName: '',
    debtorContact: '',
    totalAmount: '',
    lentDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    purpose: '',
    notes: '',
  });

  // Form state for payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [targetPotId, setTargetPotId] = useState(pots[0]?.id || '');

  // Calculate totals
  const totalOutstanding = receivables.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalPaid = receivables.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalLent = receivables.reduce((sum, r) => sum + r.totalAmount, 0);
  
  const overdueCount = receivables.filter((r) => {
    if (r.remainingAmount <= 0) return false;
    const status = getReceivableStatusInfo(r.status, r.dueDate, r.remainingAmount);
    return status.label === 'JATUH TEMPO';
  }).length;

  const unpaidCount = receivables.filter((r) => r.remainingAmount > 0).length;

  // Filter list
  const filteredList = receivables.filter((rec) => {
    // Search query
    const matchSearch =
      rec.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.purpose && rec.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.debtorContact && rec.debtorContact.includes(searchQuery));

    if (!matchSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'paid') return rec.remainingAmount <= 0;
    if (filterStatus === 'unpaid') return rec.paidAmount === 0 && rec.remainingAmount > 0;
    if (filterStatus === 'partial') return rec.paidAmount > 0 && rec.remainingAmount > 0;
    if (filterStatus === 'overdue') {
      const info = getReceivableStatusInfo(rec.status, rec.dueDate, rec.remainingAmount);
      return info.label === 'JATUH TEMPO';
    }
    return true;
  });

  const openAddModal = () => {
    retroSound.playClick();
    setFormData({
      debtorName: '',
      debtorContact: '',
      totalAmount: '',
      lentDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      purpose: '',
      notes: '',
    });
    setEditingRec(null);
    setShowAddModal(true);
  };

  const openEditModal = (rec: Receivable) => {
    retroSound.playClick();
    setFormData({
      debtorName: rec.debtorName,
      debtorContact: rec.debtorContact || '',
      totalAmount: rec.totalAmount.toString(),
      lentDate: rec.lentDate,
      dueDate: rec.dueDate,
      purpose: rec.purpose || '',
      notes: rec.notes || '',
    });
    setEditingRec(rec);
    setShowAddModal(true);
  };

  const handleSubmitReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formData.totalAmount.replace(/\D/g, ''));
    if (!formData.debtorName.trim() || isNaN(amount) || amount <= 0) {
      retroSound.playWarning();
      alert('Mohon isi nama peminjam dan nominal pinjaman yang valid!');
      return;
    }

    if (editingRec) {
      const newTotal = amount;
      const newRemaining = Math.max(0, newTotal - editingRec.paidAmount);
      let newStatus: ReceivableStatus = 'unpaid';
      if (newRemaining === 0) newStatus = 'paid';
      else if (editingRec.paidAmount > 0) newStatus = 'partial';

      onEditReceivable({
        ...editingRec,
        debtorName: formData.debtorName.trim(),
        debtorContact: formData.debtorContact.trim(),
        totalAmount: newTotal,
        remainingAmount: newRemaining,
        lentDate: formData.lentDate,
        dueDate: formData.dueDate,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim(),
        status: newStatus,
      });
      retroSound.playSuccess();
    } else {
      onAddReceivable({
        debtorName: formData.debtorName.trim(),
        debtorContact: formData.debtorContact.trim(),
        totalAmount: amount,
        lentDate: formData.lentDate,
        dueDate: formData.dueDate,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim(),
      });
      retroSound.playSuccess();
    }

    setShowAddModal(false);
  };

  const openPaymentModal = (rec: Receivable) => {
    retroSound.playCoin();
    setPayingRec(rec);
    setPaymentAmount(rec.remainingAmount.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNote(`Pelunasan piutang ${rec.debtorName}`);
    if (pots.length > 0) setTargetPotId(pots[0].id);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRec) return;
    const payNum = Number(paymentAmount.replace(/\D/g, ''));
    if (isNaN(payNum) || payNum <= 0) {
      retroSound.playWarning();
      alert('Masukkan nominal pembayaran yang valid!');
      return;
    }

    if (payNum > payingRec.remainingAmount) {
      retroSound.playWarning();
      alert(`Nominal tidak boleh melebihi sisa piutang (${formatRupiah(payingRec.remainingAmount)})!`);
      return;
    }

    onRecordPayment(payingRec.id, payNum, targetPotId, paymentDate, paymentNote);
    retroSound.playCoin();
    setPayingRec(null);
  };

  const generateWhatsappMessage = (rec: Receivable) => {
    const daysRemaining = Math.ceil(
      (new Date(rec.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    let tempoNotice = `sebelum tanggal ${formatDateIndo(rec.dueDate)}`;
    if (daysRemaining < 0) {
      tempoNotice = `yang telah jatuh tempo pada ${formatDateIndo(rec.dueDate)} (${Math.abs(daysRemaining)} hari lalu)`;
    }

    return (
      `Halo ${rec.debtorName} 👋, salam sehat selalu!\n\n` +
      `Sekadar mengingatkan dengan ramah terkait titipan piutang sebesar *${formatRupiah(rec.remainingAmount)}* ` +
      `${rec.purpose ? `(untuk ${rec.purpose})` : ''} ${tempoNotice}.\n\n` +
      `Apabila sudah siap, bisa ditransfer ke rekeningku ya. Terima kasih banyak atas kerja samanya! 🙏`
    );
  };

  const handleCopyWhatsapp = (rec: Receivable) => {
    const msg = generateWhatsappMessage(rec);
    navigator.clipboard.writeText(msg);
    retroSound.playCoin();
    alert('Pesan pengingat ramah berhasil disalin ke clipboard! Siap dikirim ke WhatsApp peminjam.');
  };

  const handleOpenWhatsapp = (rec: Receivable) => {
    const cleanPhone = (rec.debtorContact || '').replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '62' + cleanPhone.slice(1);
    }
    const msg = encodeURIComponent(generateWhatsappMessage(rec));
    const url = formattedPhone ? `https://wa.me/${formattedPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats for Receivables */}
      <div className="bg-[#1e293b] border-4 border-black p-4 sm:p-6 pixel-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black/50 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500/20 border-2 border-black flex items-center justify-center shrink-0">
              <PixelIcon name="scroll" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-base sm:text-lg text-[#f59e0b]">
                  OUTSTANDING PIUTANG
                </h2>
                <span className="bg-sky-500 text-black font-pixel text-[9px] px-1.5 py-0.5 border border-black font-bold">
                  {unpaidCount} AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans-clean mt-0.5">
                Pantau uang yang dipinjamkan, catat cicilan, dan kirimkan pengingat ramah.
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-4 py-3 border-4 border-black flex items-center justify-center gap-2 font-bold shrink-0"
          >
            <UserPlus size={18} className="text-black" />
            <span>+ CATAT PIUTANG BARU</span>
          </button>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0f172a] border-2 border-black p-3">
            <div className="text-[10px] font-pixel text-amber-400 mb-1">TOTAL OUTSTANDING</div>
            <div className="font-pixel text-sm sm:text-base text-white truncate">
              {formatRupiah(totalOutstanding)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-1">
              Uang di tangan peminjam
            </div>
          </div>

          <div className="bg-[#0f172a] border-2 border-black p-3">
            <div className="text-[10px] font-pixel text-emerald-400 mb-1">SUDAH DILUNASI</div>
            <div className="font-pixel text-sm sm:text-base text-emerald-400 truncate">
              {formatRupiah(totalPaid)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-1">
              Dari total pinjam {formatRupiah(totalLent)}
            </div>
          </div>

          <div className="bg-[#0f172a] border-2 border-black p-3">
            <div className="text-[10px] font-pixel text-sky-400 mb-1">PEMINJAM AKTIF</div>
            <div className="font-pixel text-sm sm:text-base text-sky-300">
              {unpaidCount} Orang
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-1">
              Belum lunas sepenuhnya
            </div>
          </div>

          <div className={`bg-[#0f172a] border-2 border-black p-3 ${overdueCount > 0 ? 'border-rose-600 bg-rose-950/20' : ''}`}>
            <div className="text-[10px] font-pixel text-rose-400 mb-1">JATUH TEMPO</div>
            <div className="font-pixel text-sm sm:text-base text-rose-400 flex items-center gap-1.5">
              {overdueCount > 0 && <span className="animate-pulse">⚠️</span>}
              {overdueCount} Piutang
            </div>
            <div className="text-[10px] text-slate-400 font-sans-clean mt-1">
              {overdueCount > 0 ? 'Perlu difollow-up segera' : 'Semua jatuh tempo aman'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1e293b] border-4 border-black p-3 sm:p-4 pixel-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: 'all', label: 'SEMUA' },
            { id: 'unpaid', label: 'BELUM LUNAS' },
            { id: 'partial', label: 'DICICIL' },
            { id: 'overdue', label: 'JATUH TEMPO' },
            { id: 'paid', label: 'LUNAS' },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  retroSound.playClick();
                  setFilterStatus(tab.id);
                }}
                className={`font-pixel text-[10px] px-2.5 sm:px-3 py-1.5 border-2 border-black transition-all ${
                  isActive
                    ? 'bg-[#f59e0b] text-black font-bold shadow-[2px_2px_0px_#000]'
                    : 'bg-[#0f172a] text-slate-300 hover:bg-[#334155]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari peminjam / tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border-2 border-black pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-sans-clean focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
      </div>

      {/* Receivables Grid List */}
      {filteredList.length === 0 ? (
        <div className="bg-[#1e293b] border-4 border-black p-10 text-center pixel-card">
          <div className="text-4xl mb-3">📜</div>
          <h3 className="font-pixel text-sm text-slate-300 mb-1">TIDAK ADA PIUTANG DITEMUKAN</h3>
          <p className="text-xs text-slate-400 font-sans-clean max-w-sm mx-auto mb-4">
            Tidak ada data yang cocok dengan filter atau kata kunci pencarian saat ini.
          </p>
          <button
            onClick={openAddModal}
            className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 border-2 border-black font-bold"
          >
            + CATAT PIUTANG BARU
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((rec) => {
            const statusInfo = getReceivableStatusInfo(rec.status, rec.dueDate, rec.remainingAmount);
            const percentPaid = Math.min(100, Math.round((rec.paidAmount / rec.totalAmount) * 100));
            const isFinished = rec.remainingAmount <= 0;

            return (
              <div
                key={rec.id}
                className={`bg-[#1e293b] border-4 border-black p-4 sm:p-5 pixel-card relative flex flex-col justify-between ${
                  statusInfo.label === 'JATUH TEMPO' ? 'border-l-8 border-l-rose-500' : ''
                }`}
              >
                <div>
                  {/* Card Header: Debtor Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <h4 className="font-pixel text-sm sm:text-base text-white tracking-wide">
                          {rec.debtorName}
                        </h4>
                      </div>
                      {rec.debtorContact && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans-clean mt-0.5 ml-6">
                          <Phone size={12} className="text-emerald-400" />
                          <span>{rec.debtorContact}</span>
                        </div>
                      )}
                    </div>

                    <span className={`font-pixel text-[9px] px-2 py-1 border border-black ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>

                  {/* Purpose / Alasan Pinjam */}
                  {rec.purpose && (
                    <div className="bg-[#0f172a] border border-black px-2.5 py-1 text-xs text-slate-300 font-sans-clean mb-3">
                      <span className="text-amber-400 font-semibold font-pixel text-[9px]">KEPERLUAN: </span>
                      {rec.purpose}
                    </div>
                  )}

                  {/* Amounts breakdown */}
                  <div className="bg-[#0f172a] border-2 border-black p-3 mb-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="border-r border-slate-700 pr-2">
                        <div className="text-[10px] font-pixel text-slate-400">TOTAL PINJAMAN</div>
                        <div className="font-pixel text-xs sm:text-sm text-slate-200 mt-1">
                          {formatRupiah(rec.totalAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-pixel text-amber-400">SISA OUTSTANDING</div>
                        <div className="font-pixel text-xs sm:text-sm text-amber-400 font-bold mt-1">
                          {formatRupiah(rec.remainingAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Repayment Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-sans-clean text-slate-400 mb-1">
                        <span>Sudah dicicil: {formatRupiah(rec.paidAmount)}</span>
                        <span>{percentPaid}%</span>
                      </div>
                      <div className="w-full bg-[#1e293b] h-2.5 border border-black p-0.5 pixel-progress-track">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-300"
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates & Due Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 font-sans-clean gap-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-500" />
                      <span>Dipinjam: {formatDateIndo(rec.lentDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className={statusInfo.label === 'JATUH TEMPO' ? 'text-rose-400' : 'text-amber-400'} />
                      <span className={statusInfo.label === 'JATUH TEMPO' ? 'text-rose-400 font-bold' : ''}>
                        Jatuh tempo: {formatDateIndo(rec.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {rec.notes && (
                    <p className="text-[11px] text-slate-400 italic mb-3 line-clamp-2 font-sans-clean">
                      "{rec.notes}"
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t-2 border-black/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Record Payment Button */}
                    {!isFinished && (
                      <button
                        onClick={() => openPaymentModal(rec)}
                        className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[10px] px-2.5 py-1.5 border-2 border-black flex items-center gap-1 font-bold"
                        title="Catat cicilan atau pelunasan"
                      >
                        <DollarSign size={13} />
                        <span>BAYAR</span>
                      </button>
                    )}

                    {/* Send Reminder Button */}
                    {!isFinished && (
                      <button
                        onClick={() => {
                          retroSound.playClick();
                          setReminderRec(rec);
                        }}
                        className="pixel-btn-action bg-sky-600 hover:bg-sky-500 text-white font-pixel text-[10px] px-2.5 py-1.5 border-2 border-black flex items-center gap-1"
                        title="Kirim pengingat WhatsApp"
                      >
                        <MessageSquare size={13} />
                        <span>INGATKAN</span>
                      </button>
                    )}

                    {/* View Payments History */}
                    {rec.payments && rec.payments.length > 0 && (
                      <button
                        onClick={() => {
                          retroSound.playClick();
                          setViewHistoryRec(rec);
                        }}
                        className="pixel-btn-action bg-[#0f172a] hover:bg-[#334155] text-amber-400 font-pixel text-[10px] px-2 py-1.5 border-2 border-black"
                        title="Riwayat Cicilan"
                      >
                        LOG ({rec.payments.length})
                      </button>
                    )}
                  </div>

                  {/* Edit & Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 bg-[#0f172a] border border-black"
                      title="Edit Piutang"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data piutang ${rec.debtorName}?`)) {
                          retroSound.playDelete();
                          onDeleteReceivable(rec.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#0f172a] border border-black"
                      title="Hapus Piutang"
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

      {/* MODAL: Tambah / Edit Piutang */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-lg w-full pixel-card relative my-8">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📜</span>
                <h3 className="font-pixel text-sm text-[#f59e0b]">
                  {editingRec ? 'EDIT DATA PIUTANG' : 'CATAT PIUTANG BARU'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReceivable} className="space-y-4">
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  NAMA PEMINJAM (DEBITUR) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.debtorName}
                  onChange={(e) => setFormData({ ...formData, debtorName: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    NOMOR KONTAK / WHATSAPP
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.debtorContact}
                    onChange={(e) => setFormData({ ...formData, debtorContact: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-pixel text-amber-400 mb-1">
                    TOTAL PINJAMAN (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="500000"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-amber-300 font-pixel focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                    TANGGAL PINJAM
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.lentDate}
                    onChange={(e) => setFormData({ ...formData, lentDate: e.target.value })}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-amber-400 focus:outline-none"
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
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  KEPERLUAN PINJAM
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Modal usaha, beli obat, talangan tiket"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  CATATAN TAMBAHAN
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan perjanjian, nomor rekening peminjam, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
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
                  className="pixel-btn-action bg-[#f59e0b] hover:bg-amber-400 text-black font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold"
                >
                  {editingRec ? 'SIMPAN PERUBAHAN' : 'SIMPAN PIUTANG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Catat Cicilan / Pelunasan Piutang */}
      {payingRec && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="font-pixel text-sm text-emerald-400">
                    CATAT PEMBAYARAN PIUTANG
                  </h3>
                  <p className="text-[10px] text-slate-300 font-sans-clean">
                    Peminjam: <strong>{payingRec.debtorName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayingRec(null)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0f172a] border-2 border-black p-3 mb-4 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-sans-clean">Sisa Piutang Saat Ini:</span>
              <span className="font-pixel text-amber-400 font-bold">
                {formatRupiah(payingRec.remainingAmount)}
              </span>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  NOMINAL PEMBAYARAN (RP) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1000"
                    max={payingRec.remainingAmount}
                    step="1000"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-sm text-emerald-400 font-pixel focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(payingRec.remainingAmount.toString())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-pixel px-2 py-1 border border-black font-bold"
                  >
                    LUNASI SEMUA
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  MASUKKAN KE POS KEUANGAN *
                </label>
                <select
                  value={targetPotId}
                  onChange={(e) => setTargetPotId(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-amber-400 focus:outline-none"
                >
                  {pots.map((pot) => (
                    <option key={pot.id} value={pot.id}>
                      {pot.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-sans-clean mt-1">
                  Uang pelunasan akan otomatis dicatat sebagai pemasukan di pos ini.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  TANGGAL DITERIMA
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-pixel text-slate-300 mb-1">
                  CATATAN / BUKTI TRANSFER
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer BCA, bayar cash, dll."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-[#0f172a] border-2 border-black p-2.5 text-xs text-white placeholder-slate-500 font-sans-clean focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setPayingRec(null)}
                  className="pixel-btn-action bg-slate-700 hover:bg-slate-600 text-slate-200 font-pixel text-xs px-4 py-2 border-2 border-black"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold"
                >
                  KONFIRMASI PEMBAYARAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Kirim Pengingat WhatsApp Ramah */}
      {reminderRec && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-lg w-full pixel-card relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-pixel text-sm text-sky-400">
                    PENGINGAT RAMAH WHATSAPP
                  </h3>
                  <p className="text-[10px] text-slate-300 font-sans-clean">
                    Peminjam: <strong>{reminderRec.debtorName}</strong> ({reminderRec.debtorContact || 'Belum ada nomor HP'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReminderRec(null)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans-clean mb-3">
              Template pesan sopan siap kirim agar hubungan pertemanan tetap terjaga baik:
            </p>

            {/* Message Preview Box */}
            <div className="bg-[#0f172a] border-2 border-black p-3.5 text-xs text-emerald-300 font-mono whitespace-pre-line leading-relaxed mb-4 select-all shadow-inner">
              {generateWhatsappMessage(reminderRec)}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-end">
              <button
                onClick={() => handleCopyWhatsapp(reminderRec)}
                className="pixel-btn-action bg-[#334155] hover:bg-[#475569] text-white font-pixel text-xs px-4 py-2.5 border-2 border-black"
              >
                📋 SALIN PESAN
              </button>

              <button
                onClick={() => handleOpenWhatsapp(reminderRec)}
                className="pixel-btn-action bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-5 py-2.5 border-2 border-black font-bold flex items-center justify-center gap-1.5"
              >
                <span>BUKA DI WHATSAPP</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Riwayat Cicilan / Payments History */}
      {viewHistoryRec && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#1e293b] border-4 border-black p-5 sm:p-6 max-w-md w-full pixel-card relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📜</span>
                <div>
                  <h3 className="font-pixel text-sm text-amber-400">
                    RIWAYAT CICILAN
                  </h3>
                  <p className="text-[10px] text-slate-300 font-sans-clean">
                    Peminjam: <strong>{viewHistoryRec.debtorName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewHistoryRec(null)}
                className="text-slate-400 hover:text-white font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {viewHistoryRec.payments.map((pay, idx) => (
                <div key={pay.id || idx} className="bg-[#0f172a] border-2 border-black p-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-200 font-sans-clean">
                      Cicilan #{idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans-clean">
                      {formatDateIndo(pay.date)} • {pay.note || 'Tanpa catatan'}
                    </div>
                  </div>
                  <div className="font-pixel text-xs text-emerald-400">
                    +{formatRupiah(pay.amount)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setViewHistoryRec(null)}
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
