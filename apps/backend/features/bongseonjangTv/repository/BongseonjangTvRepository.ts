import type { BongseonjangTvImage } from '../domain/BongseonjangTvImage';

export interface BongseonjangTvRepository {
  findAll(): Promise<BongseonjangTvImage[]>;
}
