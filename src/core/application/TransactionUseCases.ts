import { Transaction } from '../domain/entities';
import { ITransactionRepository } from '../ports/repositories';

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    // Validations could go here
    if (data.amount === 0) throw new Error("Amount cannot be zero");
    return this.transactionRepository.create(data);
  }
}

export class GetTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(filters?: { month?: number; year?: number; accountId?: string }): Promise<Transaction[]> {
    return this.transactionRepository.findAll(filters);
  }
}
