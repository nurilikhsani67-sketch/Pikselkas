import { User, CategoryPot, Transaction, Receivable, Debt, Investment } from '../types';

const USERS_KEY = 'pikselkas_users_v1';
const CURRENT_USER_KEY = 'pikselkas_current_user_v1';
const POTS_KEY = 'pikselkas_pots_v1';
const TRANSACTIONS_KEY = 'pikselkas_transactions_v1';
const RECEIVABLES_KEY = 'pikselkas_receivables_v1';
const DEBTS_KEY = 'pikselkas_debts_v1';
const INVESTMENTS_KEY = 'pikselkas_investments_v1';
const RESET_TOKENS_KEY = 'pikselkas_reset_tokens_v1';

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    email: 'nurilikhsani04@gmail.com',
    name: 'Nuril Ikhsani',
    avatar: '🧙‍♂️',
    password: 'password123',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'user-demo',
    email: 'demo@pikselkas.id',
    name: 'Ksatria Piksel',
    avatar: '⚔️',
    password: 'password123',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

const DEFAULT_POTS: CategoryPot[] = [
  {
    id: 'pot-1',
    name: 'Kebutuhan Pokok',
    icon: 'food',
    color: 'emerald',
    monthlyBudget: 2800000,
    description: 'Sembako, bahan dapur, makan harian keluarga',
  },
  {
    id: 'pot-2',
    name: 'Jajan & Hiburan',
    icon: 'game',
    color: 'amber',
    monthlyBudget: 1000000,
    description: 'Nongkrong kafe, camilan, tiket bioskop, game',
  },
  {
    id: 'pot-3',
    name: 'Tabungan & Harta Quest',
    icon: 'chest',
    color: 'sky',
    monthlyBudget: 2500000,
    description: 'Investasi reksadana, tabungan masa depan',
  },
  {
    id: 'pot-4',
    name: 'Kesehatan & Potion',
    icon: 'potion',
    color: 'rose',
    monthlyBudget: 600000,
    description: 'Vitamin, obat herbal, dana jaga-jaga kesehatan',
  },
  {
    id: 'pot-5',
    name: 'Tagihan & Utilitas',
    icon: 'sparkle',
    color: 'purple',
    monthlyBudget: 850000,
    description: 'Listrik PLN, WiFi rumah, langganan cloud',
  },
  {
    id: 'pot-6',
    name: 'Transportasi',
    icon: 'sword',
    color: 'orange',
    monthlyBudget: 700000,
    description: 'Bensin motor, servis berkala, e-toll',
  },
];

const DEFAULT_RECEIVABLES: Receivable[] = [
  {
    id: 'rec-1',
    debtorName: 'Budi Santoso',
    debtorContact: '081234567890',
    totalAmount: 2000000,
    paidAmount: 1000000,
    remainingAmount: 1000000,
    lentDate: '2026-08-15',
    dueDate: '2026-10-05',
    status: 'partial',
    purpose: 'Modal tambahan usaha sablon kaos',
    notes: 'Sudah cicil 1x via transfer bank. Janji lunas awal Oktober.',
    payments: [
      {
        id: 'pay-1',
        amount: 1000000,
        date: '2026-09-05',
        note: 'Cicilan ke-1 transfer BCA',
      },
    ],
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'rec-2',
    debtorName: 'Dimas Saputra',
    debtorContact: '085712349988',
    totalAmount: 1250000,
    paidAmount: 0,
    remainingAmount: 1250000,
    lentDate: '2026-09-02',
    dueDate: '2026-09-28',
    status: 'unpaid',
    purpose: 'Talangan beli part PC saat diskon',
    notes: 'Janji dibayar waktu gajian akhir bulan September.',
    payments: [],
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'rec-3',
    debtorName: 'Sarah Melati',
    debtorContact: '087899112233',
    totalAmount: 3000000,
    paidAmount: 0,
    remainingAmount: 3000000,
    lentDate: '2026-07-20',
    dueDate: '2026-09-15',
    status: 'overdue',
    purpose: 'Perbaikan atap bocor rumah darurat',
    notes: 'Jatuh tempo terlewat beberapa hari. Perlu di-follow up dengan sopan.',
    payments: [],
    createdAt: '2026-07-20T09:15:00Z',
  },
  {
    id: 'rec-4',
    debtorName: 'Farhan Kurnia',
    debtorContact: '089677884422',
    totalAmount: 500000,
    paidAmount: 500000,
    remainingAmount: 0,
    lentDate: '2026-08-28',
    dueDate: '2026-09-10',
    status: 'paid',
    purpose: 'Pinjam tiket seminar IT',
    notes: 'Lunas tepat waktu via QRIS.',
    payments: [
      {
        id: 'pay-2',
        amount: 500000,
        date: '2026-09-08',
        note: 'Pelunasan transfer QRIS',
      },
    ],
    createdAt: '2026-08-28T16:00:00Z',
  },
];

const DEFAULT_DEBTS: Debt[] = [
  {
    id: 'deb-1',
    creditorName: 'Toko Komputer Megastorage',
    creditorContact: '081298765432',
    totalAmount: 6000000,
    paidAmount: 4000000,
    remainingAmount: 2000000,
    borrowedDate: '2026-07-10',
    dueDate: '2026-10-10',
    status: 'partial',
    categoryPotId: 'pot-5',
    purpose: 'Cicilan Laptop Asus ROG untuk kerja & desain',
    notes: 'Cicilan 2 dari 3 termin sudah terbayar via transfer BCA.',
    payments: [
      {
        id: 'pay-d1',
        amount: 2000000,
        date: '2026-08-10',
        note: 'Cicilan ke-1 transfer BCA',
      },
      {
        id: 'pay-d2',
        amount: 2000000,
        date: '2026-09-10',
        note: 'Cicilan ke-2 transfer BCA',
      },
    ],
    createdAt: '2026-07-10T09:00:00Z',
  },
  {
    id: 'deb-2',
    creditorName: 'Hendra Wijaya (Teman Kantor)',
    creditorContact: '081344556677',
    totalAmount: 850000,
    paidAmount: 0,
    remainingAmount: 850000,
    borrowedDate: '2026-09-14',
    dueDate: '2026-10-01',
    status: 'unpaid',
    categoryPotId: 'pot-6',
    purpose: 'Talangan servis mendadak motor mogok di kantor',
    notes: 'Akan dibayar begitu gajian bulan depan keluar.',
    payments: [],
    createdAt: '2026-09-14T15:00:00Z',
  },
  {
    id: 'deb-3',
    creditorName: 'Om Agus Priyanto',
    creditorContact: '087788990011',
    totalAmount: 5000000,
    paidAmount: 5000000,
    remainingAmount: 0,
    borrowedDate: '2026-06-01',
    dueDate: '2026-09-05',
    status: 'paid',
    categoryPotId: 'pot-3',
    purpose: 'Pinjaman modal usaha & DP sewa tempat',
    notes: 'Alhamdulillah sudah lunas seluruhnya tepat waktu!',
    payments: [
      {
        id: 'pay-d3',
        amount: 2500000,
        date: '2026-07-28',
        note: 'Pembayaran tahap 1 cash',
      },
      {
        id: 'pay-d4',
        amount: 2500000,
        date: '2026-09-02',
        note: 'Pelunasan tahap akhir transfer Mandiri',
      },
    ],
    paidAt: '2026-09-02T11:00:00Z',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'deb-4',
    creditorName: 'Rina Kartika',
    creditorContact: '085611223344',
    totalAmount: 450000,
    paidAmount: 0,
    remainingAmount: 450000,
    borrowedDate: '2026-08-25',
    dueDate: '2026-09-18',
    status: 'overdue',
    categoryPotId: 'pot-2',
    purpose: 'Talangan tiket seminar & merchandise',
    notes: 'Terlewat beberapa hari dari janji, harus segera ditransfer!',
    payments: [],
    createdAt: '2026-08-25T13:00:00Z',
  },
];

const DEFAULT_INVESTMENTS: Investment[] = [
  {
    id: 'inv-1',
    name: 'Bank Central Asia (BBCA)',
    type: 'saham',
    platform: 'Ajaib Sekuritas',
    buyDate: '2026-05-10',
    initialAmount: 6000000,
    currentAmount: 6850000,
    units: 6,
    unitPrice: 1000000,
    notes: 'Saham perbankan defensif tier-1 pembagi dividen rutin',
    categoryPotId: 'pot-3',
    status: 'active',
    createdAt: '2026-05-10T09:30:00Z',
  },
  {
    id: 'inv-2',
    name: 'Logam Mulia Emas Antam 10g',
    type: 'emas',
    platform: 'Butik Emas Antam / Pegadaian',
    buyDate: '2026-04-12',
    initialAmount: 13200000,
    currentAmount: 14850000,
    units: 10,
    unitPrice: 1320000,
    notes: 'Aset safe-haven pelindung kekayaan dari inflasi',
    categoryPotId: 'pot-3',
    status: 'active',
    createdAt: '2026-04-12T11:00:00Z',
  },
  {
    id: 'inv-3',
    name: 'Obligasi Negara Ritel ORI025',
    type: 'obligasi',
    platform: 'Bibit Investasi',
    buyDate: '2026-02-20',
    initialAmount: 10000000,
    currentAmount: 10000000,
    units: 10,
    unitPrice: 1000000,
    notes: 'Kupon tetap (fixed rate) 6.25% p.a dijamin 100% oleh UU Negara RI',
    categoryPotId: 'pot-3',
    status: 'active',
    createdAt: '2026-02-20T14:15:00Z',
  },
  {
    id: 'inv-4',
    name: 'Sucorinvest Sharia Equity Fund',
    type: 'reksadana',
    platform: 'Bareksa',
    buyDate: '2026-06-18',
    initialAmount: 3500000,
    currentAmount: 3820000,
    units: 2450,
    unitPrice: 1428,
    notes: 'Reksadana saham syariah untuk target jangka panjang',
    categoryPotId: 'pot-3',
    status: 'active',
    createdAt: '2026-06-18T10:00:00Z',
  },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    type: 'income',
    amount: 9200000,
    categoryPotId: 'pot-3',
    date: '2026-09-01',
    title: 'Gaji Utama & Reward Petualangan',
    note: 'Gaji bulan September ditransfer utuh',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'trx-2',
    type: 'income',
    amount: 1850000,
    categoryPotId: 'pot-3',
    date: '2026-09-04',
    title: 'Project Freelance UI Game Pixel',
    note: 'Desain icon pack RPG klien luar negeri',
    createdAt: '2026-09-04T12:00:00Z',
  },
  {
    id: 'trx-3',
    type: 'income',
    amount: 1000000,
    categoryPotId: 'pot-3',
    date: '2026-09-05',
    title: 'Cicilan Piutang dari Budi Santoso',
    note: 'Pelunasan 50% piutang modal usaha',
    receivableId: 'rec-1',
    createdAt: '2026-09-05T14:00:00Z',
  },
  {
    id: 'trx-4',
    type: 'expense',
    amount: 1250000,
    categoryPotId: 'pot-1',
    date: '2026-09-02',
    title: 'Belanja Sembako Bulanan',
    note: 'Beras, minyak, daging ayam, buah, bumbu dapur',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'trx-5',
    type: 'expense',
    amount: 550000,
    categoryPotId: 'pot-5',
    date: '2026-09-03',
    title: 'Listrik PLN & WiFi 100 Mbps',
    note: 'Tagihan bulanan rumah',
    createdAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'trx-6',
    type: 'expense',
    amount: 220000,
    categoryPotId: 'pot-6',
    date: '2026-09-07',
    title: 'Isi Pertamax & Servis Oli',
    note: 'Servis rutin berkala motor',
    createdAt: '2026-09-07T15:30:00Z',
  },
  {
    id: 'trx-7',
    type: 'expense',
    amount: 185000,
    categoryPotId: 'pot-2',
    date: '2026-09-12',
    title: 'Ngopi Santai & Diskusi Tim',
    note: 'Kopi susu dan croissant di Pixel Cafe',
    createdAt: '2026-09-12T16:00:00Z',
  },
  {
    id: 'trx-8',
    type: 'expense',
    amount: 140000,
    categoryPotId: 'pot-4',
    date: '2026-09-16',
    title: 'Beli Multivitamin & Obat Herbal',
    note: 'Jaga stamina musim hujan',
    createdAt: '2026-09-16T18:00:00Z',
  },
  {
    id: 'trx-9',
    type: 'expense',
    amount: 450000,
    categoryPotId: 'pot-1',
    date: '2026-09-19',
    title: 'Restock Daging & Sayur Segar',
    note: 'Belanja mingguan pasar tradisional',
    createdAt: '2026-09-19T09:00:00Z',
  },
];

// Helper to safely read JSON
function readLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error', err);
  }
}

// Initialize seed data if not present
export function initPikselStorage(): void {
  if (!localStorage.getItem(USERS_KEY)) {
    writeLocal(USERS_KEY, DEFAULT_USERS);
  }
  if (!localStorage.getItem(POTS_KEY)) {
    writeLocal(POTS_KEY, DEFAULT_POTS);
  }
  if (!localStorage.getItem(RECEIVABLES_KEY)) {
    writeLocal(RECEIVABLES_KEY, DEFAULT_RECEIVABLES);
  }
  if (!localStorage.getItem(DEBTS_KEY)) {
    writeLocal(DEBTS_KEY, DEFAULT_DEBTS);
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    writeLocal(TRANSACTIONS_KEY, DEFAULT_TRANSACTIONS);
  }
}

export function getCurrentUser(): User | null {
  return readLocal<User | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: User | null): void {
  writeLocal(CURRENT_USER_KEY, user);
}

export function getUsers(): User[] {
  return readLocal<User[]>(USERS_KEY, DEFAULT_USERS);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  writeLocal(USERS_KEY, users);
}

export function getCategoryPots(): CategoryPot[] {
  return readLocal<CategoryPot[]>(POTS_KEY, DEFAULT_POTS);
}

export function saveCategoryPots(pots: CategoryPot[]): void {
  writeLocal(POTS_KEY, pots);
}

export function getReceivables(): Receivable[] {
  return readLocal<Receivable[]>(RECEIVABLES_KEY, DEFAULT_RECEIVABLES);
}

export function saveReceivables(recs: Receivable[]): void {
  writeLocal(RECEIVABLES_KEY, recs);
}

export function getDebts(): Debt[] {
  return readLocal<Debt[]>(DEBTS_KEY, DEFAULT_DEBTS);
}

export function saveDebts(debts: Debt[]): void {
  writeLocal(DEBTS_KEY, debts);
}

export function getInvestments(): Investment[] {
  return readLocal<Investment[]>(INVESTMENTS_KEY, DEFAULT_INVESTMENTS);
}

export function saveInvestments(investments: Investment[]): void {
  writeLocal(INVESTMENTS_KEY, investments);
}

export function getTransactions(): Transaction[] {
  return readLocal<Transaction[]>(TRANSACTIONS_KEY, DEFAULT_TRANSACTIONS);
}

export function saveTransactions(trxs: Transaction[]): void {
  writeLocal(TRANSACTIONS_KEY, trxs);
}

// Reset everything to factory demo data
export function resetToDemoData(): void {
  writeLocal(USERS_KEY, DEFAULT_USERS);
  writeLocal(POTS_KEY, DEFAULT_POTS);
  writeLocal(RECEIVABLES_KEY, DEFAULT_RECEIVABLES);
  writeLocal(DEBTS_KEY, DEFAULT_DEBTS);
  writeLocal(INVESTMENTS_KEY, DEFAULT_INVESTMENTS);
  writeLocal(TRANSACTIONS_KEY, DEFAULT_TRANSACTIONS);
}

// Password reset simulation
export interface ResetTokenRecord {
  email: string;
  code: string;
  expiresAt: number;
}

export function createResetToken(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const tokens = readLocal<ResetTokenRecord[]>(RESET_TOKENS_KEY, []);
  // Keep only non-expired
  const validTokens = tokens.filter((t) => t.expiresAt > Date.now());
  validTokens.push({
    email: email.toLowerCase(),
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  });
  writeLocal(RESET_TOKENS_KEY, validTokens);
  return code;
}

export function verifyResetCode(email: string, code: string): boolean {
  const tokens = readLocal<ResetTokenRecord[]>(RESET_TOKENS_KEY, []);
  const match = tokens.find(
    (t) => t.email.toLowerCase() === email.toLowerCase() && t.code.trim() === code.trim() && t.expiresAt > Date.now()
  );
  return Boolean(match);
}

export function completePasswordReset(email: string, newPass: string): boolean {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.password = newPass;
  saveUser(user);
  // Clear tokens for this email
  const tokens = readLocal<ResetTokenRecord[]>(RESET_TOKENS_KEY, []);
  writeLocal(
    RESET_TOKENS_KEY,
    tokens.filter((t) => t.email.toLowerCase() !== email.toLowerCase())
  );
  return true;
}
