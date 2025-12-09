import type { BadameunRepository, BadameunProduct } from '../repository/BadameunRepository';

export class BadameunService {
  constructor(private readonly badameunRepository: BadameunRepository) {}

  async getBadameunProducts(): Promise<BadameunProduct[]> {
    return this.badameunRepository.findAll();
  }
}
