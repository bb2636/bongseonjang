import { AppDataSource } from '../../../config/database';
import { UserSearchHistory } from '../../../entity/UserSearchHistory';
import type { UserSearchHistoryRepository } from './UserSearchHistoryRepository';

export class TypeORMUserSearchHistoryRepository implements UserSearchHistoryRepository {
  async findByUserId(userId: string, limit: number): Promise<UserSearchHistory[]> {
    const repository = AppDataSource.getRepository(UserSearchHistory);
    return repository.find({
      where: { userId },
      order: { searchedAt: 'DESC' },
      take: limit,
    });
  }

  async addSearchTerm(userId: string, term: string): Promise<UserSearchHistory> {
    const repository = AppDataSource.getRepository(UserSearchHistory);
    const normalizedTerm = term.toLowerCase().trim();

    const existing = await repository.findOne({
      where: { userId, term: normalizedTerm },
    });

    if (existing) {
      existing.searchedAt = new Date();
      return repository.save(existing);
    }

    const newHistory = repository.create({
      userId,
      term: normalizedTerm,
    });
    return repository.save(newHistory);
  }

  async deleteSearchTerm(userId: string, term: string): Promise<void> {
    const repository = AppDataSource.getRepository(UserSearchHistory);
    await repository.delete({ userId, term: term.toLowerCase().trim() });
  }

  async clearAll(userId: string): Promise<void> {
    const repository = AppDataSource.getRepository(UserSearchHistory);
    await repository.delete({ userId });
  }
}
