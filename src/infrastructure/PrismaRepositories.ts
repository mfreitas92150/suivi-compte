import { Category, CategoryType, Transaction, Envelope, RecurringTransaction, ExpenseGroup, MonthlyItem } from '@/core/domain/entities';
import { ICategoryRepository, ITransactionRepository, IEnvelopeRepository, IRecurringTransactionRepository, IExpenseGroupRepository, IMonthlyItemRepository } from '@/core/ports/repositories';
import { prisma } from './prisma-client';

export class PrismaMonthlyItemRepository implements IMonthlyItemRepository {
  async findByPeriod(month: number, year: number): Promise<MonthlyItem[]> {
    try {
      console.log(`PrismaMonthlyItemRepository.findByPeriod - month: ${month}, year: ${year}`);
      const items = await prisma.monthlyItem.findMany({
        where: { month, year }
      });
      console.log(`PrismaMonthlyItemRepository.findByPeriod - items found: ${items.length}`);
      return items.map(i => ({
        ...i,
        type: i.type as 'INCOME' | 'EXPENSE',
        recurringId: i.recurringId || undefined
      }));
    } catch (error) {
      console.error("PrismaMonthlyItemRepository.findByPeriod failed:", error);
      throw error;
    }
  }

  async create(item: Omit<MonthlyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyItem> {
    try {
      console.log("PrismaMonthlyItemRepository.create - data:", item);
      const i = await prisma.monthlyItem.create({
        data: {
          label: item.label,
          amount: item.amount,
          type: item.type,
          month: item.month,
          year: item.year,
          checked: item.checked,
          recurringId: item.recurringId || null
        }
      });
      return {
        ...i,
        type: i.type as 'INCOME' | 'EXPENSE',
        recurringId: i.recurringId || undefined
      };
    } catch (error) {
      console.error("PrismaMonthlyItemRepository.create failed:", error);
      throw error;
    }
  }

  async update(id: string, item: Partial<MonthlyItem>): Promise<MonthlyItem> {
    try {
      console.log("PrismaMonthlyItemRepository.update - id:", id, "data:", item);
      const data: any = {};
      if (item.label !== undefined) data.label = item.label;
      if (item.amount !== undefined) data.amount = item.amount;
      if (item.type !== undefined) data.type = item.type;
      if (item.month !== undefined) data.month = item.month;
      if (item.year !== undefined) data.year = item.year;
      if (item.checked !== undefined) data.checked = item.checked;
      if (item.recurringId !== undefined) data.recurringId = item.recurringId || null;

      const i = await prisma.monthlyItem.update({
        where: { id },
        data
      });
      return {
        ...i,
        type: i.type as 'INCOME' | 'EXPENSE',
        recurringId: i.recurringId || undefined
      };
    } catch (error) {
      console.error("PrismaMonthlyItemRepository.update failed:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.monthlyItem.delete({ where: { id } });
  }
}

export class PrismaExpenseGroupRepository implements IExpenseGroupRepository {
  async findAll(): Promise<ExpenseGroup[]> {
    return prisma.expenseGroup.findMany({ orderBy: { order: 'asc' } });
  }

  async create(data: Omit<ExpenseGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseGroup> {
    return prisma.expenseGroup.create({ data });
  }

  async update(id: string, data: Partial<ExpenseGroup>): Promise<ExpenseGroup> {
    return prisma.expenseGroup.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.expenseGroup.delete({ where: { id } });
  }
}

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany();
    return categories.map(c => ({
      ...c,
      type: c.type as CategoryType
    }));
  }

  async findById(id: string): Promise<Category | null> {
    const c = await prisma.category.findUnique({ where: { id } });
    if (!c) return null;
    return { 
      ...c, 
      type: c.type as CategoryType
    };
  }

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    try {
      console.log("PrismaCategoryRepository.create - data:", category);
      const c = await prisma.category.create({ 
        data: {
          name: category.name,
          type: category.type,
          defaultAmount: category.defaultAmount
        } 
      });
      return { 
        ...c, 
        type: c.type as CategoryType,
        defaultAmount: c.defaultAmount ?? undefined
      };
    } catch (error) {
      console.error("PrismaCategoryRepository.create failed:", error);
      throw error;
    }
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    try {
      console.log("PrismaCategoryRepository.update - id:", id, "data:", category);
      const data: any = {};
      if (category.name !== undefined) data.name = category.name;
      if (category.type !== undefined) data.type = category.type;
      if (category.defaultAmount !== undefined) data.defaultAmount = category.defaultAmount;

      const c = await prisma.category.update({ 
        where: { id }, 
        data 
      });
      return { 
        ...c, 
        type: c.type as CategoryType,
        defaultAmount: c.defaultAmount ?? undefined
      };
    } catch (error) {
      console.error("PrismaCategoryRepository.update failed:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}

export class PrismaTransactionRepository implements ITransactionRepository {
  async findAll(filters?: { month?: number; year?: number; accountId?: string }): Promise<Transaction[]> {
    const where: any = {};
    if (filters?.accountId) where.accountId = filters.accountId;
    if (filters?.month !== undefined && filters?.year !== undefined) {
      const startDate = new Date(filters.year, filters.month - 1, 1);
      const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }
    const transactions = await prisma.transaction.findMany({ 
      where,
      orderBy: { date: 'desc' }
    });
    return transactions;
  }

  async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const t = await prisma.transaction.create({ data: transaction });
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: transaction.amount
        }
      }
    });
    return t;
  }

  async delete(id: string): Promise<void> {
    const t = await prisma.transaction.findUnique({ where: { id } });
    if (t) {
      await prisma.account.update({
        where: { id: t.accountId },
        data: { balance: { decrement: t.amount } }
      });
      await prisma.transaction.delete({ where: { id } });
    }
  }
}

export class PrismaEnvelopeRepository implements IEnvelopeRepository {
  async findByPeriod(month: number, year: number): Promise<Envelope[]> {
    return prisma.envelope.findMany({ where: { month, year } });
  }

  async upsert(envelope: Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>): Promise<Envelope> {
    try {
      console.log("PrismaEnvelopeRepository.upsert - data:", envelope);
      const e = await prisma.envelope.upsert({
        where: {
          categoryId_month_year: {
            categoryId: envelope.categoryId,
            month: envelope.month,
            year: envelope.year
          }
        },
        update: { 
          amount: envelope.amount 
        },
        create: {
          categoryId: envelope.categoryId,
          month: envelope.month,
          year: envelope.year,
          amount: envelope.amount
        }
      });
      return e;
    } catch (error) {
      console.error("PrismaEnvelopeRepository.upsert failed:", error);
      throw error;
    }
  }
}

export class PrismaRecurringTransactionRepository implements IRecurringTransactionRepository {
  async findAll(): Promise<RecurringTransaction[]> {
    const recurring = await prisma.recurringTransaction.findMany({
      include: { group: true }
    });
    return recurring.map(r => ({
      ...r,
      groupId: r.groupId || undefined,
      group: r.group ? { ...r.group } : undefined,
      categoryId: r.categoryId || undefined,
      type: r.type as 'INCOME' | 'EXPENSE'
    }));
  }

  async create(recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransaction> {
    const { group, ...data } = recurring as any;
    const r = await prisma.recurringTransaction.create({ 
      data,
      include: { group: true }
    });
    return { 
      ...r, 
      groupId: r.groupId || undefined,
      group: r.group ? { ...r.group } : undefined,
      categoryId: r.categoryId || undefined,
      type: r.type as 'INCOME' | 'EXPENSE' 
    };
  }

  async update(id: string, recurring: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const { group, ...data } = recurring as any;
    const r = await prisma.recurringTransaction.update({
      where: { id },
      data,
      include: { group: true }
    });
    return { 
      ...r, 
      groupId: r.groupId || undefined,
      group: r.group ? { ...r.group } : undefined,
      categoryId: r.categoryId || undefined,
      type: r.type as 'INCOME' | 'EXPENSE' 
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.recurringTransaction.delete({ where: { id } });
  }
}
