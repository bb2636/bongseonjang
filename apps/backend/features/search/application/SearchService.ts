import type { SearchTermRepository } from '../repository/SearchTermRepository';
import type { UserSearchHistoryRepository } from '../repository/UserSearchHistoryRepository';

export interface PopularSearchTermDto {
  term: string;
  searchCount: number;
}

export interface UserSearchHistoryDto {
  term: string;
  searchedAt: Date;
}

export class SearchService {
  constructor(
    private searchTermRepository: SearchTermRepository,
    private userSearchHistoryRepository?: UserSearchHistoryRepository
  ) {}

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

  async getUserSearchHistory(userId: string, limit: number = 10): Promise<UserSearchHistoryDto[]> {
    if (!this.userSearchHistoryRepository) {
      throw new Error('User search history repository not configured');
    }
    const history = await this.userSearchHistoryRepository.findByUserId(userId, limit);
    return history.map(h => ({
      term: h.term,
      searchedAt: h.searchedAt,
    }));
  }

  async addUserSearchHistory(userId: string, term: string): Promise<void> {
    if (!this.userSearchHistoryRepository) {
      throw new Error('User search history repository not configured');
    }
    if (!term || term.trim().length === 0) {
      return;
    }
    await this.userSearchHistoryRepository.addSearchTerm(userId, term.trim());
    await this.searchTermRepository.upsertSearchTerm(term.trim());
  }

  async deleteUserSearchHistory(userId: string, term: string): Promise<void> {
    if (!this.userSearchHistoryRepository) {
      throw new Error('User search history repository not configured');
    }
    await this.userSearchHistoryRepository.deleteSearchTerm(userId, term);
  }

  async clearUserSearchHistory(userId: string): Promise<void> {
    if (!this.userSearchHistoryRepository) {
      throw new Error('User search history repository not configured');
    }
    await this.userSearchHistoryRepository.clearAll(userId);
  }
}
