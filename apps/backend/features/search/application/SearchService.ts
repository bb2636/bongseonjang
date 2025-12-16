import type { SearchTermRepository } from '../repository/SearchTermRepository';

export interface PopularSearchTermDto {
  term: string;
  searchCount: number;
}

export class SearchService {
  constructor(private searchTermRepository: SearchTermRepository) {}

  async recordSearch(term: string): Promise<void> {
    if (!term || term.trim().length === 0) {
      return;
    }
    await this.searchTermRepository.upsertSearchTerm(term.trim());
  }

  async getPopularSearchTerms(limit: number = 10): Promise<PopularSearchTermDto[]> {
    const terms = await this.searchTermRepository.findPopular(limit);
    return terms.map(t => ({
      term: t.term,
      searchCount: t.searchCount,
    }));
  }
}
