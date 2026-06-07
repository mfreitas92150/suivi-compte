import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Account, Transaction, Category, Envelope, RecurringTransaction, ExpenseGroup, MonthlyItem } from '@/core/domain/entities';

const api = axios.create({
  baseURL: '/api',
});

// Pilotage
export const useMonthlyItems = (filters: { month: number; year: number }) => {
  return useQuery<MonthlyItem[]>({
    queryKey: ['monthly-items', filters],
    queryFn: async () => {
      const { data } = await api.get('/pilotage/items', { params: filters });
      return data;
    },
  });
};

export const useCreateMonthlyItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<MonthlyItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: created } = await api.post('/pilotage/items', data);
      return created;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-items', { month: variables.month, year: variables.year }] });
    },
  });
};

export const useUpdateMonthlyItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, month, year, ...data }: Partial<MonthlyItem> & { id: string, month: number, year: number }) => {
      const { data: updated } = await api.patch('/pilotage/items', { id, ...data });
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-items', { month: variables.month, year: variables.year }] });
    },
  });
};

export const useDeleteMonthlyItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, month, year }: { id: string, month: number, year: number }) => {
      await api.delete(`/pilotage/items?id=${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-items', { month: variables.month, year: variables.year }] });
    },
  });
};

export const useInitializeMonth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number, year: number }) => {
      const { data } = await api.post('/pilotage/init', { month, year });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-items', { month: variables.month, year: variables.year }] });
      queryClient.invalidateQueries({ queryKey: ['envelopes', { month: variables.month, year: variables.year }] });
    },
  });
};

// Config Recurring
export const useRecurringTransactions = () => {
  return useQuery<RecurringTransaction[]>({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/config/recurring');
      return data;
    },
  });
};

export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<RecurringTransaction> & { id: string }) => {
      const { data: updated } = await api.put('/config/recurring', data);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
  });
};

export const useCreateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt' | 'active'>) => {
      const { data: created } = await api.post('/config/recurring', data);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
  });
};

export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/config/recurring?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
  });
};

// Accounts
export const useAccounts = () => {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get('/accounts');
      return data;
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Account> & { id: string }) => {
      const { data: updated } = await api.patch('/accounts', { id, ...data });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: created } = await api.post('/accounts', data);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/accounts?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Categories
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: created } = await api.post('/categories', data);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Category> & { id: string }) => {
      const { data: updated } = await api.patch('/categories', { id, ...data });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Envelopes
export const useEnvelopes = (filters?: { month: number; year: number }) => {
  return useQuery<Envelope[]>({
    queryKey: ['envelopes', filters],
    queryFn: async () => {
      const { data } = await api.get('/envelopes', { params: filters });
      return data;
    },
  });
};

export const useUpsertEnvelope = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (envelope: Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post('/envelopes', envelope);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['envelopes', { month: variables.month, year: variables.year }] });
    },
  });
};

// Groups
export const useExpenseGroups = () => {
  return useQuery<ExpenseGroup[]>({
    queryKey: ['expense-groups'],
    queryFn: async () => {
      const { data } = await api.get('/config/groups');
      return data;
    },
  });
};

export const useCreateExpenseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/config/groups', { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
    },
  });
};

export const useUpdateExpenseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ExpenseGroup> & { id: string }) => {
      const { data: updated } = await api.patch('/config/groups', { id, ...data });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
    },
  });
};

export const useDeleteExpenseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/config/groups?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
    },
  });
};

// Transactions
export const useTransactions = (filters?: { month?: number; year?: number; accountId?: string }) => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data } = await api.get('/transactions', { params: filters });
      return data;
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await api.post('/transactions', transaction);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { data: updated } = await api.patch('/transactions', { id, ...data });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
