import type { BongseonjangTvImage } from '../domain/BongseonjangTvImage';
import type { BongseonjangTvRepository } from './BongseonjangTvRepository';

export class TypeORMBongseonjangTvRepository implements BongseonjangTvRepository {
  async findAll(): Promise<BongseonjangTvImage[]> {
    return [];
  }
}
