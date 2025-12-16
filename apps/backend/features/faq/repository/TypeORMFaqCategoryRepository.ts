import { AppDataSource } from '../../../config/database';
import { FaqCategory } from '../../../entity';
import type { FaqCategoryRepository } from './FaqCategoryRepository';

export class TypeORMFaqCategoryRepository implements FaqCategoryRepository {
  private get repository() {
    return AppDataSource.getRepository(FaqCategory);
  }

  async findAll(): Promise<FaqCategory[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: number): Promise<FaqCategory | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
    });
  }
}
