import type { UserSearchHistory } from '../../../entity/UserSearchHistory';

export interface UserSearchHistoryRepository {
  findByUserId(userId: string, limit: number): Promise<UserSearchHistory[]>;
  addSearchTerm(userId: string, term: string): Promise<UserSearchHistory>;
  deleteSearchTerm(userId: string, term: string): Promise<void>;
  clearAll(userId: string): Promise<void>;
}
