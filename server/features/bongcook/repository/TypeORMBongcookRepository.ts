import type { BongcookProduct, BongcookRepository } from './BongcookRepository';

export class TypeORMBongcookRepository implements BongcookRepository {
  async findAll(): Promise<BongcookProduct[]> {
    return [];
  }
}
