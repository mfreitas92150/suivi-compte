import { Account, Category, Transaction, Envelope, MedicalTracking, Savings, RecurringTransaction, ExpenseGroup, MonthlyItem } from '../domain/entities';

export interface IMonthlyItemRepository {
  findByPeriod(month: number, year: number): Promise<MonthlyItem[]>;
  create(item: Omit<MonthlyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyItem>;
  update(id: string, item: Partial<MonthlyItem>): Promise<MonthlyItem>;
  delete(id: string): Promise<void>;
}

export interface IAccountRepository {
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  update(id: string, account: Partial<Account>): Promise<Account>;
  delete(id: string): Promise<void>;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export interface ITransactionRepository {
  findAll(filters?: { month?: number; year?: number; accountId?: string }): Promise<Transaction[]>;
  create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

export interface IEnvelopeRepository {
  findByPeriod(month: number, year: number): Promise<Envelope[]>;
  upsert(envelope: Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>): Promise<Envelope>;
}

export interface IMedicalTrackingRepository {
  findAll(): Promise<MedicalTracking[]>;
  create(entry: Omit<MedicalTracking, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalTracking>;
}

export interface ISavingsRepository {
  findAll(): Promise<Savings[]>;
  upsert(savings: Omit<Savings, 'id' | 'createdAt' | 'updatedAt'>): Promise<Savings>;
}

export interface IExpenseGroupRepository {
  findAll(): Promise<ExpenseGroup[]>;
  create(data: Omit<ExpenseGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseGroup>;
  update(id: string, data: Partial<ExpenseGroup>): Promise<ExpenseGroup>;
  delete(id: string): Promise<void>;
}

export interface IRecurringTransactionRepository {
  findAll(): Promise<RecurringTransaction[]>;
  create(recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransaction>;
  update(id: string, recurring: Partial<RecurringTransaction>): Promise<RecurringTransaction>;
  delete(id: string): Promise<void>;
}
