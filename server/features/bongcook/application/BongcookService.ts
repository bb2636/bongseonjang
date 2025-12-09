import type { BongcookProduct, BongcookRepository } from '../repository/BongcookRepository';

export class BongcookService {
  constructor(private readonly repository: BongcookRepository) {}

  async getAllProducts(): Promise<BongcookProduct[]> {
    return this.repository.findAll();
  }
}
