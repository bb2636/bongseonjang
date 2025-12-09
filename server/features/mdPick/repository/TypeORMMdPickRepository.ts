import type { MdPickRepository, MdPickProduct } from './MdPickRepository';

export class TypeORMMdPickRepository implements MdPickRepository {
  async findAll(): Promise<MdPickProduct[]> {
    return [];
  }
}
