import { Account } from '../domain/entities';
import { IAccountRepository } from '../ports/repositories';

export class CreateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return this.accountRepository.create(data);
  }
}
