import { Account } from '../domain/entities';
import { IAccountRepository } from '../ports/repositories';

export class GetAccountsUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }
}
