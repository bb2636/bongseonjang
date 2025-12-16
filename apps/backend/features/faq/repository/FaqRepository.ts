import type { Faq } from '../../../entity';

export interface FaqRepository {
  findAllForAdmin(keyword?: string, categoryId?: number): Promise<Faq[]>;
  findByIdForAdmin(id: number): Promise<Faq | null>;
  findAll(keyword?: string, categoryId?: number): Promise<Faq[]>;
  findById(id: number): Promise<Faq | null>;
  create(data: { categoryId: number; title: string; content: string; isVisible?: boolean }): Promise<Faq>;
  update(id: number, data: { categoryId?: number; title?: string; content?: string; isVisible?: boolean }): Promise<Faq | null>;
  delete(id: number): Promise<boolean>;
  countAll(): Promise<number>;
  countVisible(): Promise<number>;
}
