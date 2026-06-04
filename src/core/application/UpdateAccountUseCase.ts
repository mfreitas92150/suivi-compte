import { Account } from '../domain/entities';
import { IAccountRepository } from '../ports/repositories';

export class UpdateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(id: string, data: Partial<Account>): Promise<Account> {
    return this.accountRepository.update(id, data);
  }
}
