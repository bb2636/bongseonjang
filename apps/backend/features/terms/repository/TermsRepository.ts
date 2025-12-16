import type { Terms, TermsType } from '../../../entity';

export interface TermsRepository {
  findLatestByType(type: TermsType): Promise<Terms | null>;
  findAll(type?: TermsType): Promise<Terms[]>;
  findById(id: number): Promise<Terms | null>;
  create(data: { type: TermsType; title: string; content: string; isActive?: boolean }): Promise<Terms>;
  update(id: number, data: { title?: string; content?: string; isActive?: boolean }): Promise<Terms | null>;
}
