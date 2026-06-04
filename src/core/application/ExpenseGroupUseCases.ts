import { ExpenseGroup } from '../domain/entities';
import { IExpenseGroupRepository } from '../ports/repositories';

export class ExpenseGroupUseCases {
  constructor(private repository: IExpenseGroupRepository) {}

  async getAll(): Promise<ExpenseGroup[]> {
    return this.repository.findAll();
  }

  async create(name: string): Promise<ExpenseGroup> {
    return this.repository.create({ name, order: 0 });
  }

  async update(id: string, data: Partial<ExpenseGroup>): Promise<ExpenseGroup> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
