import { MonthlyItem } from '../domain/entities';
import { IMonthlyItemRepository, ICategoryRepository, IRecurringTransactionRepository, IEnvelopeRepository } from '../ports/repositories';

export class GetMonthlyItemsUseCase {
  constructor(private monthlyItemRepository: IMonthlyItemRepository) {}

  async execute(month: number, year: number): Promise<MonthlyItem[]> {
    return this.monthlyItemRepository.findByPeriod(month, year);
  }
}

export class CreateMonthlyItemUseCase {
  constructor(private monthlyItemRepository: IMonthlyItemRepository) {}

  async execute(data: Omit<MonthlyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyItem> {
    return this.monthlyItemRepository.create(data);
  }
}

export class UpdateMonthlyItemUseCase {
  constructor(private monthlyItemRepository: IMonthlyItemRepository) {}

  async execute(id: string, data: Partial<MonthlyItem>): Promise<MonthlyItem> {
    return this.monthlyItemRepository.update(id, data);
  }
}

export class DeleteMonthlyItemUseCase {
  constructor(private monthlyItemRepository: IMonthlyItemRepository) {}

  async execute(id: string): Promise<void> {
    return this.monthlyItemRepository.delete(id);
  }
}

export class InitializeMonthUseCase {
  constructor(
    private categoryRepo: ICategoryRepository,
    private recurringRepo: IRecurringTransactionRepository,
    private envelopeRepo: IEnvelopeRepository,
    private monthlyItemRepo: IMonthlyItemRepository
  ) {}

  async execute(month: number, year: number): Promise<void> {
    // 1. Check if already initialized
    const existingEnvelopes = await this.envelopeRepo.findByPeriod(month, year);
    const existingItems = await this.monthlyItemRepo.findByPeriod(month, year);
    
    if (existingEnvelopes.length > 0 || existingItems.length > 0) {
      throw new Error("Le mois est déjà initialisé.");
    }

    // 2. Create Envelopes from Category templates
    const categories = await this.categoryRepo.findAll();
    for (const cat of categories) {
      if (cat.defaultAmount !== null && cat.defaultAmount !== undefined && cat.type === 'EXPENSE') {
        await this.envelopeRepo.upsert({
          categoryId: cat.id,
          month,
          year,
          amount: cat.defaultAmount
        });
      }
    }

    // 3. Create MonthlyItems from RecurringTransaction templates
    const recurring = await this.recurringRepo.findAll();
    for (const rec of recurring) {
      if (rec.active) {
        await this.monthlyItemRepo.create({
          label: rec.label,
          amount: rec.amount,
          type: rec.type,
          month,
          year,
          checked: false,
          recurringId: rec.id
        });
      }
    }
  }
}
