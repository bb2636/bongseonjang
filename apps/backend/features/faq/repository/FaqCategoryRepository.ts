import type { FaqCategory } from '../../../entity';

export interface FaqCategoryRepository {
  findAll(): Promise<FaqCategory[]>;
  findById(id: number): Promise<FaqCategory | null>;
}
