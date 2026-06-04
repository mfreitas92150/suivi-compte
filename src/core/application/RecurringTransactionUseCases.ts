import { RecurringTransaction } from '../domain/entities';
import { IRecurringTransactionRepository } from '../ports/repositories';

export class GetRecurringTransactionsUseCase {
  constructor(private repository: IRecurringTransactionRepository) {}

  async execute(): Promise<RecurringTransaction[]> {
    return this.repository.findAll();
  }
}

export class CreateRecurringTransactionUseCase {
  constructor(private repository: IRecurringTransactionRepository) {}

  async execute(data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransaction> {
    return this.repository.create(data);
  }
}

export class UpdateRecurringTransactionUseCase {
  constructor(private repository: IRecurringTransactionRepository) {}

  async execute(id: string, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    return this.repository.update(id, data);
  }
}

export class DeleteRecurringTransactionUseCase {
  constructor(private repository: IRecurringTransactionRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
