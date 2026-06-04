import { Account, AccountType } from '@/core/domain/entities';
import { IAccountRepository } from '@/core/ports/repositories';
import { prisma } from './prisma-client';

export class PrismaAccountRepository implements IAccountRepository {
  async findAll(): Promise<Account[]> {
    const accounts = await prisma.account.findMany();
    return accounts.map(a => ({
      ...a,
      type: a.type as AccountType
    }));
  }

  async findById(id: string): Promise<Account | null> {
    const a = await prisma.account.findUnique({ where: { id } });
    if (!a) return null;
    return {
      ...a,
      type: a.type as AccountType
    };
  }

  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const a = await prisma.account.create({
      data: account
    });
    return {
      ...a,
      type: a.type as AccountType
    };
  }

  async update(id: string, account: Partial<Account>): Promise<Account> {
    const a = await prisma.account.update({
      where: { id },
      data: account
    });
    return {
      ...a,
      type: a.type as AccountType
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({ where: { id } });
  }
}
