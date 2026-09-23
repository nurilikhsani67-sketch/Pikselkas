import React, { useState, useEffect } from 'react';
import { 
  User, 
  CategoryPot, 
  Receivable, 
  Debt,
  Investment,
  SavingsAccount,
  Transaction, 
  ActiveTab,
  ReceivableStatus,
  DebtStatus
} from './types';
import { 
  initPikselStorage, 
  getCurrentUser, 
  setCurrentUser, 
  getCategoryPots, 
  saveCategoryPots, 
  getReceivables, 
  saveReceivables, 
  getDebts,
  saveDebts,
  getInvestments,
  saveInvestments,
  getSavings,
  saveSavings,
  getTransactions, 
  saveTransactions,
  resetToDemoData
} from './utils/storage';
import { retroSound } from './utils/sound';
import { PixelHeader } from './components/PixelHeader';
import { PixelNavigation } from './components/PixelNavigation';
import { DashboardOverview } from './components/DashboardOverview';
import { SavingsManager } from './components/SavingsManager';
import { ReceivablesManager } from './components/ReceivablesManager';
import { DebtsManager } from './components/DebtsManager';
import { InvestmentsManager } from './components/InvestmentsManager';
import { FinancialPotsManager } from './components/FinancialPotsManager';
import { TransactionsManager } from './components/TransactionsManager';
import { AuthPage } from './components/auth/AuthPage';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [pots, setPots] = useState<CategoryPot[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Modal triggering states across components
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [selectedPotForTrx, setSelectedPotForTrx] = useState<string | undefined>(undefined);

  // Initial load
  useEffect(() => {
    initPikselStorage();
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
    }
    setPots(getCategoryPots());
    setReceivables(getReceivables());
    setDebts(getDebts());
    setInvestments(getInvestments());
    setSavings(getSavings());
    setTransactions(getTransactions());
  }, []);

  // Sync helpers
  const updatePots = (newPots: CategoryPot[]) => {
    setPots(newPots);
    saveCategoryPots(newPots);
  };

  const updateReceivables = (newRecs: Receivable[]) => {
    setReceivables(newRecs);
    saveReceivables(newRecs);
  };

  const updateDebts = (newDebts: Debt[]) => {
    setDebts(newDebts);
    saveDebts(newDebts);
  };

  const updateInvestments = (newInvs: Investment[]) => {
    setInvestments(newInvs);
    saveInvestments(newInvs);
  };

  const updateSavings = (newSavings: SavingsAccount[]) => {
    setSavings(newSavings);
    saveSavings(newSavings);
  };

  const updateTransactions = (newTrxs: Transaction[]) => {
    setTransactions(newTrxs);
    saveTransactions(newTrxs);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUserState(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleResetDemo = () => {
    resetToDemoData();
    setPots(getCategoryPots());
    setReceivables(getReceivables());
    setDebts(getDebts());
    setInvestments(getInvestments());
    setSavings(getSavings());
    setTransactions(getTransactions());
    alert('Data keuangan telah direset ke setelan awal demo!');
  };

  // Receivables Handlers
  const handleAddReceivable = (newRecData: Omit<Receivable, 'id' | 'createdAt' | 'paidAmount' | 'remainingAmount' | 'status' | 'payments'>) => {
    const newRec: Receivable = {
      ...newRecData,
      id: `rec-${Date.now()}`,
      paidAmount: 0,
      remainingAmount: newRecData.totalAmount,
      status: 'unpaid',
      payments: [],
      createdAt: new Date().toISOString(),
    };
    updateReceivables([newRec, ...receivables]);
  };

  const handleEditReceivable = (updatedRec: Receivable) => {
    const updated = receivables.map((r) => (r.id === updatedRec.id ? updatedRec : r));
    updateReceivables(updated);
  };

  const handleDeleteReceivable = (id: string) => {
    const updated = receivables.filter((r) => r.id !== id);
    updateReceivables(updated);
  };

  const handleRecordReceivablePayment = (
    receivableId: string, 
    amount: number, 
    potId: string, 
    date: string, 
    note?: string
  ) => {
    const targetRec = receivables.find((r) => r.id === receivableId);
    if (!targetRec) return;

    const newPaid = targetRec.paidAmount + amount;
    const newRemaining = Math.max(0, targetRec.totalAmount - newPaid);
    let newStatus: ReceivableStatus = 'partial';
    if (newRemaining <= 0) {
      newStatus = 'paid';
    }

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      amount,
      date,
      note: note || `Cicilan piutang ${targetRec.debtorName}`,
    };

    const updatedRec: Receivable = {
      ...targetRec,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newStatus,
      payments: [newPaymentRecord, ...(targetRec.payments || [])],
    };

    // Update receivables
    updateReceivables(receivables.map((r) => (r.id === receivableId ? updatedRec : r)));

    // Automatically create an income transaction
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      type: 'income',
      amount,
      categoryPotId: potId,
      date,
      title: `Pelunasan Piutang: ${targetRec.debtorName}`,
      note: note || `Pembayaran piutang (${targetRec.purpose || 'Pinjaman'})`,
      receivableId: targetRec.id,
      createdAt: new Date().toISOString(),
    };
    updateTransactions([newTrx, ...transactions]);
  };

  // Debts Handlers
  const handleAddDebt = (newDebtData: Omit<Debt, 'id' | 'createdAt' | 'paidAmount' | 'remainingAmount' | 'status' | 'payments'>) => {
    const newDebt: Debt = {
      ...newDebtData,
      id: `debt-${Date.now()}`,
      paidAmount: 0,
      remainingAmount: newDebtData.totalAmount,
      status: 'unpaid',
      payments: [],
      createdAt: new Date().toISOString(),
    };
    updateDebts([newDebt, ...debts]);
  };

  const handleEditDebt = (updatedDebt: Debt) => {
    const updated = debts.map((d) => (d.id === updatedDebt.id ? updatedDebt : d));
    updateDebts(updated);
  };

  const handleDeleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    updateDebts(updated);
  };

  const handleRecordDebtPayment = (
    debtId: string, 
    amount: number, 
    potId: string, 
    date: string, 
    note?: string
  ) => {
    const targetDebt = debts.find((d) => d.id === debtId);
    if (!targetDebt) return;

    const newPaid = targetDebt.paidAmount + amount;
    const newRemaining = Math.max(0, targetDebt.totalAmount - newPaid);
    let newStatus: DebtStatus = 'partial';
    if (newRemaining <= 0) {
      newStatus = 'paid';
    }

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      amount,
      date,
      note: note || `Pembayaran cicilan utang kepada ${targetDebt.creditorName}`,
    };

    const updatedDebt: Debt = {
      ...targetDebt,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newStatus,
      payments: [newPaymentRecord, ...(targetDebt.payments || [])],
    };

    updateDebts(debts.map((d) => (d.id === debtId ? updatedDebt : d)));

    // Automatically create an expense transaction
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      type: 'expense',
      amount,
      categoryPotId: potId,
      date,
      title: `Bayar Utang: ${targetDebt.creditorName}`,
      note: note || `Pembayaran kewajiban/utang (${targetDebt.purpose || 'Pinjaman'})`,
      debtId: targetDebt.id,
      createdAt: new Date().toISOString(),
    };
    updateTransactions([newTrx, ...transactions]);
  };

  // Investments Handlers
  const handleAddInvestment = (
    invData: Omit<Investment, 'id' | 'createdAt' | 'status'>,
    deductFromPot?: boolean
  ) => {
    const newInv: Investment = {
      ...invData,
      id: `inv-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    updateInvestments([newInv, ...investments]);

    // If user checked "catat pengeluaran kas otomatis"
    if (deductFromPot && invData.categoryPotId) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        type: 'expense',
        amount: invData.initialAmount,
        categoryPotId: invData.categoryPotId,
        date: invData.buyDate,
        title: `Beli Investasi: ${invData.name}`,
        note: `Modal beli instrumen ${invData.type} via ${invData.platform || 'Sekuritas/Toko'}`,
        createdAt: new Date().toISOString(),
      };
      updateTransactions([newTrx, ...transactions]);
    }
  };

  const handleEditInvestment = (updatedInv: Investment) => {
    updateInvestments(investments.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv)));
  };

  const handleDeleteInvestment = (id: string) => {
    updateInvestments(investments.filter((inv) => inv.id !== id));
  };

  const handleUpdateInvestmentValuation = (id: string, newCurrentAmount: number) => {
    const target = investments.find((i) => i.id === id);
    if (!target) return;
    const updated: Investment = {
      ...target,
      currentAmount: newCurrentAmount,
      updatedAt: new Date().toISOString(),
    };
    updateInvestments(investments.map((i) => (i.id === id ? updated : i)));
  };

  const handleSellInvestment = (id: string, soldAmount: number, targetPotId?: string) => {
    const target = investments.find((i) => i.id === id);
    if (!target) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: Investment = {
      ...target,
      status: 'sold',
      soldAmount,
      currentAmount: soldAmount,
      soldDate: todayStr,
      updatedAt: new Date().toISOString(),
    };
    updateInvestments(investments.map((i) => (i.id === id ? updated : i)));

    // Create income transaction
    if (targetPotId) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        type: 'income',
        amount: soldAmount,
        categoryPotId: targetPotId,
        date: todayStr,
        title: `Pencairan: ${target.name}`,
        note: `Hasil penjualan instrumen ${target.type} (Modal: ${target.initialAmount})`,
        createdAt: new Date().toISOString(),
      };
      updateTransactions([newTrx, ...transactions]);
    }
  };

  // Savings Handlers
  const handleAddSavings = (
    savingsData: Omit<SavingsAccount, 'id' | 'createdAt' | 'logs'>,
    deductFromPot?: boolean
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialLog = savingsData.balance > 0 ? [{
      id: `slog-${Date.now()}`,
      type: 'deposit' as const,
      amount: savingsData.balance,
      date: todayStr,
      note: 'Setoran saldo awal tabungan',
    }] : [];

    const newSavingsAcc: SavingsAccount = {
      ...savingsData,
      id: `sav-${Date.now()}`,
      logs: initialLog,
      createdAt: new Date().toISOString(),
    };
    updateSavings([newSavingsAcc, ...savings]);

    // Optional: deduct from cash transaction
    if (deductFromPot && savingsData.balance > 0) {
      const targetPotId = pots.find(p => p.name.toLowerCase().includes('tabungan'))?.id || pots[0]?.id;
      if (targetPotId) {
        const newTrx: Transaction = {
          id: `trx-${Date.now()}`,
          type: 'expense',
          amount: savingsData.balance,
          categoryPotId: targetPotId,
          date: todayStr,
          title: `Alokasi Tabungan: ${savingsData.bankName}`,
          note: `Penempatan saldo awal ${savingsData.accountName} (${savingsData.bankName})`,
          createdAt: new Date().toISOString(),
        };
        updateTransactions([newTrx, ...transactions]);
      }
    }
  };

  const handleEditSavings = (updated: SavingsAccount) => {
    updateSavings(savings.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSavings = (id: string) => {
    updateSavings(savings.filter((s) => s.id !== id));
  };

  const handleDepositSavings = (id: string, amount: number, note?: string, potId?: string) => {
    const target = savings.find((s) => s.id === id);
    if (!target) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog = {
      id: `slog-${Date.now()}`,
      type: 'deposit' as const,
      amount,
      date: todayStr,
      note: note || 'Setor tabungan',
    };

    const updated: SavingsAccount = {
      ...target,
      balance: target.balance + amount,
      logs: [newLog, ...(target.logs || [])],
      updatedAt: new Date().toISOString(),
    };
    updateSavings(savings.map((s) => (s.id === id ? updated : s)));

    // Create expense transaction if synced with pot
    if (potId) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        type: 'expense',
        amount,
        categoryPotId: potId,
        date: todayStr,
        title: `Setor Tabungan: ${target.bankName}`,
        note: note ? `Setor ke ${target.accountName}: ${note}` : `Setoran tabungan ke ${target.accountName}`,
        createdAt: new Date().toISOString(),
      };
      updateTransactions([newTrx, ...transactions]);
    }
  };

  const handleWithdrawSavings = (id: string, amount: number, note?: string, potId?: string) => {
    const target = savings.find((s) => s.id === id);
    if (!target) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog = {
      id: `slog-${Date.now()}`,
      type: 'withdraw' as const,
      amount,
      date: todayStr,
      note: note || 'Penarikan tabungan',
    };

    const updated: SavingsAccount = {
      ...target,
      balance: Math.max(0, target.balance - amount),
      logs: [newLog, ...(target.logs || [])],
      updatedAt: new Date().toISOString(),
    };
    updateSavings(savings.map((s) => (s.id === id ? updated : s)));

    // Create income transaction if synced with pot
    if (potId) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        type: 'income',
        amount,
        categoryPotId: potId,
        date: todayStr,
        title: `Tarik Tabungan: ${target.bankName}`,
        note: note ? `Penarikan dari ${target.accountName}: ${note}` : `Penarikan tabungan dari ${target.accountName}`,
        createdAt: new Date().toISOString(),
      };
      updateTransactions([newTrx, ...transactions]);
    }
  };

  // Pots Handlers
  const handleAddPot = (newPotData: Omit<CategoryPot, 'id'>) => {
    const newPot: CategoryPot = {
      ...newPotData,
      id: `pot-${Date.now()}`,
    };
    updatePots([...pots, newPot]);
  };

  const handleEditPot = (updatedPot: CategoryPot) => {
    updatePots(pots.map((p) => (p.id === updatedPot.id ? updatedPot : p)));
  };

  const handleDeletePot = (id: string) => {
    updatePots(pots.filter((p) => p.id !== id));
  };

  // Transactions Handlers
  const handleAddTransaction = (trxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTrx: Transaction = {
      ...trxData,
      id: `trx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateTransactions([newTrx, ...transactions]);
  };

  const handleEditTransaction = (updatedTrx: Transaction) => {
    updateTransactions(transactions.map((t) => (t.id === updatedTrx.id ? updatedTrx : t)));
  };

  const handleDeleteTransaction = (id: string) => {
    updateTransactions(transactions.filter((t) => t.id !== id));
  };

  // Quick action from dashboard or pots
  const handleQuickExpenseForPot = (potId: string) => {
    setSelectedPotForTrx(potId);
    setActiveTab('transactions');
    setIsTrxModalOpen(true);
  };

  // If user is not logged in, show AuthPage
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }

  // Count active / overdue receivables for badge indicator
  const unpaidCount = receivables.filter((r) => r.remainingAmount > 0).length;
  const overdueCount = receivables.filter((r) => {
    if (r.remainingAmount <= 0) return false;
    const due = new Date(r.dueDate).getTime();
    return due < Date.now() || r.status === 'overdue';
  }).length;

  // Count active / overdue debts for badge indicator
  const unpaidDebtsCount = debts.filter((d) => d.remainingAmount > 0).length;
  const overdueDebtsCount = debts.filter((d) => {
    if (d.remainingAmount <= 0) return false;
    const due = new Date(d.dueDate).getTime();
    return due < Date.now() || d.status === 'overdue';
  }).length;

  // Active investments count
  const activeInvestmentsCount = investments.filter((i) => i.status !== 'sold').length;

  return (
    <div className="min-h-screen pixel-bg text-slate-100 flex flex-col font-sans-clean">
      {/* 8-bit Header */}
      <PixelHeader 
        user={currentUser} 
        onLogout={handleLogout} 
        onResetDemo={handleResetDemo}
      />

      {/* Retro Navigation Tabs */}
      <PixelNavigation 
        activeTab={activeTab} 
        onChangeTab={setActiveTab}
        unpaidReceivablesCount={unpaidCount}
        overdueReceivablesCount={overdueCount}
        unpaidDebtsCount={unpaidDebtsCount}
        overdueDebtsCount={overdueDebtsCount}
        investmentsCount={activeInvestmentsCount}
        savingsCount={savings.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            pots={pots}
            receivables={receivables}
            debts={debts}
            investments={investments}
            savings={savings}
            transactions={transactions}
            onNavigateTab={setActiveTab}
            onOpenNewTransaction={() => {
              setSelectedPotForTrx(undefined);
              setActiveTab('transactions');
              setIsTrxModalOpen(true);
            }}
            onOpenNewSavings={() => {
              setActiveTab('savings');
            }}
            onOpenNewInvestment={() => {
              setActiveTab('investments');
            }}
            onOpenNewReceivable={() => {
              setActiveTab('receivables');
            }}
            onOpenNewDebt={() => {
              setActiveTab('debts');
            }}
            onOpenNewPot={() => {
              setActiveTab('pots');
            }}
            onPayReceivable={(rec) => {
              setActiveTab('receivables');
            }}
            onPayDebt={(debt) => {
              setActiveTab('debts');
            }}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsManager
            savings={savings}
            pots={pots}
            onAddSavings={handleAddSavings}
            onEditSavings={handleEditSavings}
            onDeleteSavings={handleDeleteSavings}
            onDepositSavings={handleDepositSavings}
            onWithdrawSavings={handleWithdrawSavings}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsManager
            investments={investments}
            pots={pots}
            onAddInvestment={handleAddInvestment}
            onEditInvestment={handleEditInvestment}
            onDeleteInvestment={handleDeleteInvestment}
            onUpdateCurrentValue={handleUpdateInvestmentValuation}
            onSellInvestment={handleSellInvestment}
          />
        )}

        {activeTab === 'receivables' && (
          <ReceivablesManager
            receivables={receivables}
            pots={pots}
            onAddReceivable={handleAddReceivable}
            onEditReceivable={handleEditReceivable}
            onDeleteReceivable={handleDeleteReceivable}
            onRecordPayment={handleRecordReceivablePayment}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsManager
            debts={debts}
            pots={pots}
            onAddDebt={handleAddDebt}
            onEditDebt={handleEditDebt}
            onDeleteDebt={handleDeleteDebt}
            onRecordPayment={handleRecordDebtPayment}
          />
        )}

        {activeTab === 'pots' && (
          <FinancialPotsManager
            pots={pots}
            transactions={transactions}
            onAddPot={handleAddPot}
            onEditPot={handleEditPot}
            onDeletePot={handleDeletePot}
            onQuickExpenseForPot={handleQuickExpenseForPot}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsManager
            transactions={transactions}
            pots={pots}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            preselectedPotId={selectedPotForTrx}
            isAddModalOpen={isTrxModalOpen}
            onCloseAddModal={() => setIsTrxModalOpen(false)}
          />
        )}
      </main>

      {/* Retro Footer */}
      <footer className="border-t-2 border-black/80 bg-[#0b1120] py-4 px-4 text-center text-xs text-slate-500 font-pixel">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PIKSELKAS &bull; CATATAN KEUANGAN, TABUNGAN BANK, INVESTASI, PIUTANG & UTANG</span>
          <span className="text-amber-400/80">GAME OVER? TIDAK, KEUANGANMU AMAN! 🎮</span>
        </div>
      </footer>
    </div>
  );
}
