import type { BadameunProduct, BadameunRepository } from './BadameunRepository';

export class TypeORMBadameunRepository implements BadameunRepository {
  async findAll(): Promise<BadameunProduct[]> {
    return [];
  }
}
