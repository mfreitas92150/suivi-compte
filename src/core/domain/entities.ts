export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'OTHER';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  defaultAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTransaction {
  id: string;
  label: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  groupId?: string;
  group?: ExpenseGroup;
  active: boolean;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  accountId: string;
  categoryId: string;
  isFixed: boolean;
  checked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Envelope {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalTracking {
  id: string;
  date: Date;
  description: string;
  totalAmount: number;
  socialSecurity: number;
  mutualInsurance: number;
  restToPay: number;
  isReimbursed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Savings {
  id: string;
  month: number;
  year: number;
  amount: number;
  target?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyItem {
  id: string;
  label: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  month: number;
  year: number;
  checked: boolean;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
}
