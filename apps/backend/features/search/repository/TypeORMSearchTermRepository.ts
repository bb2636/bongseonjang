import { AppDataSource } from '../../../config/database';
import { SearchTerm } from '../../../entity/SearchTerm';
import type { SearchTermRepository } from './SearchTermRepository';

export class TypeORMSearchTermRepository implements SearchTermRepository {
  async findByTerm(term: string): Promise<SearchTerm | null> {
    const repository = AppDataSource.getRepository(SearchTerm);
    return repository.findOne({ where: { term: term.toLowerCase() } });
  }

  async upsertSearchTerm(term: string): Promise<SearchTerm> {
    const repository = AppDataSource.getRepository(SearchTerm);
    const normalizedTerm = term.toLowerCase().trim();
    
    const existing = await repository.findOne({ where: { term: normalizedTerm } });
    
    if (existing) {
      existing.searchCount += 1;
      existing.lastSearchedAt = new Date();
      return repository.save(existing);
    }
    
    const newSearchTerm = repository.create({
      term: normalizedTerm,
      searchCount: 1,
    });
    return repository.save(newSearchTerm);
  }

  async findPopular(limit: number): Promise<SearchTerm[]> {
    const repository = AppDataSource.getRepository(SearchTerm);
    return repository.find({
      order: { searchCount: 'DESC' },
      take: limit,
    });
  }
}
