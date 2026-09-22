export type TransactionType = 'income' | 'expense';

export type ReceivableStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export type DebtStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  password?: string;
  createdAt: string;
}

export interface CategoryPot {
  id: string;
  name: string;
  icon: 'food' | 'game' | 'chest' | 'potion' | 'sword' | 'shield' | 'scroll' | 'house' | 'sparkle' | 'heart';
  color: 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'orange' | 'teal';
  monthlyBudget: number;
  description?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryPotId: string;
  date: string; // YYYY-MM-DD
  title: string;
  note?: string;
  receivableId?: string; // If this transaction came from a debt receivable repayment
  debtId?: string; // If this transaction was an expense for paying off a debt
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Receivable {
  id: string;
  debtorName: string;
  debtorContact?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  lentDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: ReceivableStatus;
  purpose?: string;
  notes?: string;
  payments: PaymentRecord[];
  createdAt: string;
}

export interface Debt {
  id: string;
  creditorName: string; // Pihak yang meminjamkan uang (kreditur, teman, bank, keluarga, dll.)
  creditorContact?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  borrowedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: DebtStatus;
  categoryPotId?: string; // Pos anggaran terkait jika ada
  purpose?: string; // Keperluan utang
  notes?: string;
  payments: PaymentRecord[];
  paidAt?: string; // Tanggal lunas ketika utang sudah terbayar
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'receivables' | 'debts' | 'pots' | 'transactions';

export type AuthMode = 'login' | 'register' | 'forgot_password';
