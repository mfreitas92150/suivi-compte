import { Envelope } from '../domain/entities';
import { IEnvelopeRepository } from '../ports/repositories';

export class GetEnvelopesUseCase {
  constructor(private envelopeRepository: IEnvelopeRepository) {}

  async execute(month: number, year: number): Promise<Envelope[]> {
    return this.envelopeRepository.findByPeriod(month, year);
  }
}

export class UpsertEnvelopeUseCase {
  constructor(private envelopeRepository: IEnvelopeRepository) {}

  async execute(data: Omit<Envelope, 'id' | 'createdAt' | 'updatedAt'>): Promise<Envelope> {
    return this.envelopeRepository.upsert(data);
  }
}
