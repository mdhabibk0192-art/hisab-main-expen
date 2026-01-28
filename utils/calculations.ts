
import { DailyRow, Transaction, EntryType } from '../types';
import { DAYS_TO_TRACK } from '../constants.tsx';

export const generateInitialRows = (): DailyRow[] => {
  const rows: DailyRow[] = [];
  const today = new Date();
  
  for (let i = 0; i < DAYS_TO_TRACK; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    rows.push({
      date: dateStr,
      income: [],
      expenses: [],
      bills: [],
      extraIncome: [],
      notes: '',
      dailyBalance: 0,
      carryForward: 0
    });
  }
  return rows;
};

export const calculateBalances = (rows: DailyRow[]): DailyRow[] => {
  // Sort by date ascending to calculate carry forward
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  
  let currentCarry = 0;
  
  const updated = sorted.map((row) => {
    const incomeTotal = row.income.reduce((sum, t) => sum + t.amount, 0);
    const extraTotal = row.extraIncome.reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = row.expenses.reduce((sum, t) => sum + t.amount, 0);
    const billTotal = row.bills.reduce((sum, t) => sum + t.amount, 0);
    
    const dailyNet = (incomeTotal + extraTotal) - (expenseTotal + billTotal);
    const carryForward = currentCarry;
    const dailyBalance = carryForward + dailyNet;
    
    currentCarry = dailyBalance;
    
    return {
      ...row,
      carryForward,
      dailyBalance
    };
  });
  
  // Return in reverse chronological (newest first)
  return updated.sort((a, b) => b.date.localeCompare(a.date));
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
