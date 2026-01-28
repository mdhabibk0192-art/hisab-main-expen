
export enum EntryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  BILL_PAID = 'bill_paid',
  BILL_UNPAID = 'bill_unpaid',
  EXTRA = 'extra'
}

export interface Transaction {
  id: string;
  type: EntryType;
  category: string;
  amount: number;
  notes?: string;
  timestamp: number;
}

export interface DailyRow {
  date: string; // YYYY-MM-DD
  income: Transaction[];
  expenses: Transaction[];
  bills: Transaction[];
  extraIncome: Transaction[];
  notes: string;
  dailyBalance: number;
  carryForward: number;
}

export interface AppLog {
  id: string;
  action: 'ADD' | 'EDIT' | 'DELETE' | 'SYNC' | 'AI_PROCESS';
  description: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export interface AppState {
  rows: DailyRow[];
  logs: AppLog[];
  user: UserProfile;
  lastSync: number | null;
}
