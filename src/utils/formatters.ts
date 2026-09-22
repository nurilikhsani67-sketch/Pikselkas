import { ReceivableStatus, DebtStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return `Rp ${amount}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getDaysRemaining(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const due = new Date(dueDateStr).getTime();
  const today = new Date().getTime();
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getReceivableStatusInfo(status: ReceivableStatus, dueDate: string, remainingAmount: number) {
  if (remainingAmount <= 0) {
    return {
      label: 'LUNAS',
      color: 'bg-emerald-500 text-black border-emerald-700',
      textColor: 'text-emerald-400',
      icon: '✅',
      description: 'Piutang sudah selesai dibayar',
    };
  }

  const days = getDaysRemaining(dueDate);
  if (days < 0 || status === 'overdue') {
    return {
      label: 'JATUH TEMPO',
      color: 'bg-rose-500 text-white border-rose-800 animate-pulse',
      textColor: 'text-rose-400',
      icon: '⚠️',
      description: `Lewat ${Math.abs(days)} hari dari tenggat`,
    };
  }

  if (status === 'partial') {
    return {
      label: 'DICICIL',
      color: 'bg-amber-400 text-black border-amber-600',
      textColor: 'text-amber-400',
      icon: '⏳',
      description: `Tersisa ${days} hari lagi`,
    };
  }

  return {
    label: 'BELUM LUNAS',
    color: 'bg-sky-400 text-black border-sky-600',
    textColor: 'text-sky-400',
    icon: '📌',
    description: `Tersisa ${days} hari lagi`,
  };
}

export function getDebtStatusInfo(status: DebtStatus, dueDate: string, remainingAmount: number) {
  if (remainingAmount <= 0) {
    return {
      isPaid: true,
      label: 'SUDAH TERBAYAR',
      shortLabel: 'LUNAS',
      color: 'bg-emerald-500 text-black border-2 border-emerald-300 font-bold shadow-[2px_2px_0px_#000]',
      badgeColor: 'bg-emerald-600 text-white border-2 border-emerald-400',
      stampBorder: 'border-emerald-400 text-emerald-400 bg-emerald-950/60',
      textColor: 'text-emerald-400',
      icon: '✅',
      description: 'Kewajiban utang telah lunas seluruhnya! Bebas tanggungan.',
    };
  }

  const days = getDaysRemaining(dueDate);
  if (days < 0 || status === 'overdue') {
    return {
      isPaid: false,
      label: 'JATUH TEMPO',
      shortLabel: 'OVERDUE',
      color: 'bg-rose-500 text-white border-2 border-rose-800 animate-pulse font-bold',
      badgeColor: 'bg-rose-600 text-white border-2 border-rose-400',
      stampBorder: 'border-rose-400 text-rose-400 bg-rose-950/60',
      textColor: 'text-rose-400',
      icon: '⚠️',
      description: `Sudah lewat ${Math.abs(days)} hari dari tanggal jatuh tempo`,
    };
  }

  if (status === 'partial') {
    return {
      isPaid: false,
      label: 'DICICIL',
      shortLabel: 'DICICIL',
      color: 'bg-amber-400 text-black border-2 border-amber-600 font-bold',
      badgeColor: 'bg-amber-500 text-black border-2 border-amber-300',
      stampBorder: 'border-amber-400 text-amber-400 bg-amber-950/60',
      textColor: 'text-amber-400',
      icon: '⏳',
      description: `Sedang dicicil, jatuh tempo ${days} hari lagi`,
    };
  }

  return {
    isPaid: false,
    label: 'BELUM DIBAYAR',
    shortLabel: 'BELUM DIBAYAR',
    color: 'bg-orange-500 text-black border-2 border-orange-700 font-bold',
    badgeColor: 'bg-orange-600 text-white border-2 border-orange-400',
    stampBorder: 'border-orange-400 text-orange-400 bg-orange-950/60',
    textColor: 'text-orange-400',
    icon: '📋',
    description: `Tenggat pembayaran ${days} hari lagi`,
  };
}

