import { IAccountRepository } from '../ports/repositories';

export class DeleteAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(id: string): Promise<void> {
    await this.accountRepository.delete(id);
  }
}
