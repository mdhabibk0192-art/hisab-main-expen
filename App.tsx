
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyRow, Transaction, EntryType, AppState, AppLog } from './types';
import { generateInitialRows, calculateBalances } from './utils/calculations';
import ExcelTable from './components/ExcelTable';
import AIAssistant from './components/AIAssistant';
import { Icons } from './constants';

const LOCAL_STORAGE_KEY = 'smart_ledger_app_state_v1';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      rows: generateInitialRows(),
      logs: [],
      user: { name: 'Guest User', email: '', isLoggedIn: false },
      lastSync: null
    };
  });

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addLog = useCallback((action: AppLog['action'], description: string) => {
    setState(prev => ({
      ...prev,
      logs: [{
        id: crypto.randomUUID(),
        action,
        description,
        timestamp: Date.now()
      }, ...prev.logs].slice(0, 100)
    }));
  }, []);

  const handleAddEntry = (date: string, type: EntryType, entryData?: Partial<Transaction>) => {
    const amount = entryData?.amount || parseFloat(prompt(`Enter amount for ${type}:`, '0') || '0');
    if (isNaN(amount) || amount === 0) return;

    const category = entryData?.category || prompt(`Enter category (e.g., Food, Salary):`, 'Other') || 'Other';

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      type,
      category,
      amount,
      notes: entryData?.notes || '',
      timestamp: Date.now()
    };

    setState(prev => {
      const newRows = prev.rows.map(row => {
        if (row.date === date) {
          if (type === EntryType.INCOME) return { ...row, income: [...row.income, newTx] };
          if (type === EntryType.EXPENSE) return { ...row, expenses: [...row.expenses, newTx] };
          if (type === EntryType.BILL_PAID || type === EntryType.BILL_UNPAID) return { ...row, bills: [...row.bills, newTx] };
          if (type === EntryType.EXTRA) return { ...row, extraIncome: [...row.extraIncome, newTx] };
        }
        return row;
      });
      return { ...prev, rows: calculateBalances(newRows) };
    });

    addLog('ADD', `Added ${type} of ${amount} for ${date}`);
  };

  const handleDeleteTransaction = (date: string, type: EntryType, id: string) => {
    setState(prev => {
      const newRows = prev.rows.map(row => {
        if (row.date === date) {
          return {
            ...row,
            income: row.income.filter(t => t.id !== id),
            expenses: row.expenses.filter(t => t.id !== id),
            bills: row.bills.filter(t => t.id !== id),
            extraIncome: row.extraIncome.filter(t => t.id !== id),
          };
        }
        return row;
      });
      return { ...prev, rows: calculateBalances(newRows) };
    });
    addLog('DELETE', `Deleted transaction from ${date}`);
  };

  const handleEditNotes = (date: string, notes: string) => {
    setState(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.date === date ? { ...row, notes } : row)
    }));
  };

  const handleAIResults = (entries: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    entries.forEach(entry => {
      const targetDate = entry.date || today;
      handleAddEntry(targetDate, entry.type, {
        category: entry.category,
        amount: entry.amount,
        notes: entry.notes
      });
    });
    addLog('AI_PROCESS', `Processed ${entries.length} entries via AI`);
  };

  const stats = useMemo(() => {
    const totalIncome = state.rows.reduce((s, r) => s + r.income.reduce((si, t) => si + t.amount, 0), 0);
    const totalExpenses = state.rows.reduce((s, r) => s + r.expenses.reduce((si, t) => si + t.amount, 0), 0);
    const balance = state.rows[0]?.dailyBalance || 0;
    return { totalIncome, totalExpenses, balance };
  }, [state.rows]);

  const handleGoogleLogin = async () => {
    // In a real app, this would use Google Auth SDK
    // Here we simulate it
    setState(prev => ({
      ...prev,
      user: { name: 'John Doe', email: 'john@example.com', isLoggedIn: true }
    }));
    addLog('SYNC', 'Logged in and synced with Google Drive');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
            <i className="fas fa-table-list"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Smart Ledger AI</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">365-Day Intelligent Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-4 border-r border-slate-200 pr-4 mr-2">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Balance</p>
              <p className={`text-sm font-black ${stats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.balance)}
              </p>
            </div>
          </div>

          {!state.user.isLoggedIn ? (
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <i className="fab fa-google text-red-500"></i>
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Login</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
               <div className="text-right hidden md:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cloud Sync</p>
                  <p className="text-[10px] text-green-500 font-bold">Encrypted & Active</p>
               </div>
               <img src={`https://picsum.photos/seed/${state.user.email}/40/40`} className="w-9 h-9 rounded-full ring-2 ring-indigo-50/50" alt="avatar" />
            </div>
          )}
        </div>
      </header>

      {/* Main Stats (Mobile Optimized) */}
      <div className="sm:hidden p-4 grid grid-cols-3 gap-2 bg-white border-b border-slate-100">
        <div className="bg-green-50/50 p-2 rounded-lg border border-green-100">
           <p className="text-[8px] font-bold text-green-600 uppercase">Income</p>
           <p className="text-xs font-bold text-green-700">{Math.round(stats.totalIncome)}</p>
        </div>
        <div className="bg-red-50/50 p-2 rounded-lg border border-red-100">
           <p className="text-[8px] font-bold text-red-600 uppercase">Expense</p>
           <p className="text-xs font-bold text-red-700">{Math.round(stats.totalExpenses)}</p>
        </div>
        <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
           <p className="text-[8px] font-bold text-indigo-600 uppercase">Net</p>
           <p className="text-xs font-bold text-indigo-700">{Math.round(stats.balance)}</p>
        </div>
      </div>

      {/* Grid Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden px-0 sm:px-4 py-4">
        <ExcelTable 
          rows={state.rows} 
          onAddEntry={handleAddEntry}
          onEditNotes={handleEditNotes}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      {/* Daily Notification Simulation Toast */}
      {state.logs.length > 0 && state.logs[0].action === 'ADD' && (
        <div className="fixed top-20 right-4 z-40 bg-indigo-900 text-white px-4 py-2 rounded-lg shadow-xl animate-in slide-in-from-right duration-500 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <i className="fas fa-bell"></i>
          </div>
          <div>
            <p className="text-xs font-bold">10:00 AM Reminder</p>
            <p className="text-[10px] opacity-80">Don't forget to record your tea expense!</p>
          </div>
        </div>
      )}

      {/* Action Logs Drawer (Simplified) */}
      <div className="fixed bottom-6 left-6 z-50 group">
        <button className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:w-32 transition-all duration-300 overflow-hidden whitespace-nowrap">
           <i className="fas fa-history p-3"></i>
           <span className="opacity-0 group-hover:opacity-100 font-bold text-xs pr-4">View History</span>
        </button>
        <div className="absolute bottom-12 left-0 w-64 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform scale-95 group-hover:scale-100 origin-bottom-left p-4 max-h-80 overflow-y-auto border border-slate-700">
           <h4 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">Recent Logs</h4>
           <div className="space-y-3">
              {state.logs.length === 0 ? <p className="text-[10px] text-slate-500">No logs yet.</p> : state.logs.map(log => (
                <div key={log.id} className="text-[10px] flex items-start gap-2 border-l border-slate-700 pl-2">
                   <span className="font-black text-indigo-400">[{log.action}]</span>
                   <span className="opacity-80">{log.description}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <AIAssistant onProcess={handleAIResults} />
    </div>
  );
};

export default App;
