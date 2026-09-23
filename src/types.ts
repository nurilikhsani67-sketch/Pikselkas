export type TransactionType = 'income' | 'expense';

export type ReceivableStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export type DebtStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export type SavingsCategory = 'emergency_fund' | 'daily' | 'dream_goal' | 'family' | 'investment_buffer' | 'other';

export interface SavingsLog {
  id: string;
  type: 'deposit' | 'withdraw'; // setor atau tarik
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface SavingsAccount {
  id: string;
  bankName: string; // misal "BCA", "Bank Mandiri", "BRI", "BSI", "Bank Jago", "SeaBank"
  accountName: string; // misal "Tabungan Dana Darurat", "Tabungan Beli Mobil", "Rekening Gaji"
  accountNumber?: string; // misal "527-019-8821"
  accountHolder?: string; // misal "Nuril Ikhsani"
  balance: number; // nominal uang yang ditabung saat ini (Rp)
  targetAmount?: number; // target nominal tabungan (Rp)
  category: SavingsCategory;
  color?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'purple' | 'teal';
  icon?: string;
  notes?: string;
  logs: SavingsLog[];
  createdAt: string;
  updatedAt?: string;
}

export type InvestmentType = 
  | 'saham'
  | 'emas'
  | 'obligasi'
  | 'reksadana'
  | 'kripto'
  | 'deposito'
  | 'properti'
  | 'lainnya';

export interface Investment {
  id: string;
  name: string; // misal "BBCA", "Logam Mulia Antam 10gr", "Obligasi ORI025"
  type: InvestmentType; // jenis investasi yang dipilih
  platform?: string; // misal "Bibit", "Ajaib", "Pegadaian", "BCA", dll.
  buyDate: string; // YYYY-MM-DD
  initialAmount: number; // Modal beli awal (Rp)
  currentAmount: number; // Nilai / valuasi saat ini (Rp)
  units?: number; // Jumlah unit (lembar/gram/lot/koin)
  unitPrice?: number; // Harga beli per unit (Rp)
  notes?: string; // Catatan strategi / deviden / target
  categoryPotId?: string; // Pos anggaran terkait jika ada
  status: 'active' | 'sold';
  soldAmount?: number;
  soldDate?: string;
  createdAt: string;
  updatedAt?: string;
}

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

export type ActiveTab = 'dashboard' | 'savings' | 'investments' | 'receivables' | 'debts' | 'pots' | 'transactions';

export type AuthMode = 'login' | 'register' | 'forgot_password';
