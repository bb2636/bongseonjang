import type { BongseonjangTvImage } from '../domain/BongseonjangTvImage';
import type { BongseonjangTvRepository } from '../repository/BongseonjangTvRepository';

export class BongseonjangTvService {
  constructor(private readonly repository: BongseonjangTvRepository) {}

  async getAllImages(): Promise<BongseonjangTvImage[]> {
    return this.repository.findAll();
  }
}
