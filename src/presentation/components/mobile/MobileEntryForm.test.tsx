import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MobileEntryForm } from './MobileEntryForm';
import * as useApi from '@/presentation/hooks/useApi';

vi.mock('@/presentation/hooks/useApi', () => ({
  useAccounts: vi.fn(),
  useCategories: vi.fn(),
  useCreateTransaction: vi.fn(),
}));

const mockAccounts = [
  { id: 'acc1', name: 'Main Account' },
  { id: 'acc2', name: 'Savings' },
];

const mockCategories = [
  { id: 'cat1', name: 'Food', type: 'EXPENSE' },
  { id: 'cat2', name: 'Rent', type: 'EXPENSE' },
  { id: 'cat3', name: 'Salary', type: 'INCOME' },
];

describe('MobileEntryForm', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi.useAccounts as any).mockReturnValue({ data: mockAccounts });
    (useApi.useCategories as any).mockReturnValue({ data: mockCategories });
    (useApi.useCreateTransaction as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders correctly with accounts and expense categories', () => {
    render(<MobileEntryForm />);

    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Quoi ? (ex: Courses)')).toBeInTheDocument();
    
    // Check accounts
    expect(screen.getByText('Main Account')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
    
    // Check expense categories
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    
    // Income category should be filtered out
    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
  });

  it('calls createTransaction with correct data on submit', async () => {
    render(<MobileEntryForm />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '50.5' } });
    fireEvent.change(screen.getByPlaceholderText('Quoi ? (ex: Courses)'), { target: { value: 'Groceries' } });
    
    fireEvent.click(screen.getByText('Food'));
    fireEvent.click(screen.getByText('Main Account'));
    
    fireEvent.click(screen.getByText('ENREGISTRER'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        description: 'Groceries',
        amount: -50.5,
        categoryId: 'cat1',
        accountId: 'acc1',
        date: expect.any(Date),
        isFixed: false,
        checked: false,
      });
    });
    
    expect(screen.getByText("C'est noté !")).toBeInTheDocument();
  });

  it('allows changing date via shortcuts and date input', async () => {
    render(<MobileEntryForm />);
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dateInput = screen.getByLabelText("Date de l'opération") as HTMLInputElement;
    
    expect(dateInput.value).toBe(today);
    
    const yesterdayBtn = screen.getByText("Hier");
    fireEvent.click(yesterdayBtn);
    expect(dateInput.value).toBe(yesterday);
    
    const todayBtn = screen.getByText("Aujourd'hui");
    fireEvent.click(todayBtn);
    expect(dateInput.value).toBe(today);

    // Manual change
    fireEvent.change(dateInput, { target: { value: '2026-06-01' } });
    expect(dateInput.value).toBe('2026-06-01');
  });
});
