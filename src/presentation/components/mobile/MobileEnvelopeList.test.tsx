import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MobileEnvelopeList } from './MobileEnvelopeList';
import * as useApi from '@/presentation/hooks/useApi';

vi.mock('@/presentation/hooks/useApi', () => ({
  useCategories: vi.fn(),
  useEnvelopes: vi.fn(),
  useTransactions: vi.fn(),
}));

const mockCategories = [
  { id: 'cat1', name: 'Food', type: 'EXPENSE' },
  { id: 'cat2', name: 'Rent', type: 'EXPENSE' },
  { id: 'cat3', name: 'Salary', type: 'INCOME' },
];

const mockEnvelopes = [
  { id: 'env1', categoryId: 'cat1', amount: 500, month: 6, year: 2026 },
  { id: 'env2', categoryId: 'cat2', amount: 1000, month: 6, year: 2026 },
];

const mockTransactions = [
  { id: 'tx1', categoryId: 'cat1', amount: -100, description: 'Groceries' },
  { id: 'tx2', categoryId: 'cat1', amount: -50, description: 'Snacks' },
];

describe('MobileEnvelopeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useApi.useCategories as any).mockReturnValue({ data: mockCategories });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useApi.useEnvelopes as any).mockReturnValue({ data: mockEnvelopes });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useApi.useTransactions as any).mockReturnValue({ data: mockTransactions });
    
    // Mock date to 2026-06-01
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 1)); // Month is 0-indexed, so 5 is June
  });

  it('renders correctly with envelopes and transactions', () => {
    render(<MobileEnvelopeList />);

    // Total Budget = 500 + 1000 = 1500
    // Total Spent = 100 + 50 = 150
    // Total Remaining = 1500 - 150 = 1350
    expect(screen.getByText(/1\s*350,00\s*€/)).toBeInTheDocument();

    // Check categories
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();

    // Check Budget display
    expect(screen.getByText(/500\s*€/)).toBeInTheDocument();
    expect(screen.getAllByText(/1\s*000\s*€/)).toHaveLength(2);

    // Check Remaining display
    // Food: 500 - 150 = 350
    expect(screen.getByText(/350\s*€/)).toBeInTheDocument();
  });

  it('filters out income categories', () => {
    render(<MobileEnvelopeList />);
    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
  });

  it('handles negative remaining balance', () => {
    const overspentTransactions = [
      { id: 'tx1', categoryId: 'cat1', amount: -600, description: 'Expensive Dinner' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useApi.useTransactions as any).mockReturnValue({ data: overspentTransactions });

    render(<MobileEnvelopeList />);

    // Food remaining: 500 - 600 = -100
    const remainingText = screen.getByText(/-100\s*€/);
    expect(remainingText).toBeInTheDocument();
    expect(remainingText).toHaveClass('text-red-500');
  });
});
