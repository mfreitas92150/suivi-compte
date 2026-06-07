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

  it('toggles yesterday date', async () => {
    render(<MobileEntryForm />);
    
    const yesterdayToggle = screen.getByText("Transaction d'hier ?").nextElementSibling;
    expect(yesterdayToggle).toBeInTheDocument();
    
    fireEvent.click(yesterdayToggle!);
    
    // Check if toggle changed color (it should have bg-blue-600 when active)
    expect(yesterdayToggle).toHaveClass('bg-blue-600');
    
    fireEvent.click(yesterdayToggle!);
    expect(yesterdayToggle).toHaveClass('bg-gray-200');
  });
});
