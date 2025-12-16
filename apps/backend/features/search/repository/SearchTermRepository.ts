import type { SearchTerm } from '../../../entity/SearchTerm';

export interface SearchTermRepository {
  findByTerm(term: string): Promise<SearchTerm | null>;
  upsertSearchTerm(term: string): Promise<SearchTerm>;
  findPopular(limit: number): Promise<SearchTerm[]>;
}
