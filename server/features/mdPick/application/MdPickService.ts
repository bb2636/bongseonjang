import type { MdPickRepository, MdPickProduct } from '../repository/MdPickRepository';

export class MdPickService {
  constructor(private readonly mdPickRepository: MdPickRepository) {}

  async getMdPicks(): Promise<MdPickProduct[]> {
    return this.mdPickRepository.findAll();
  }
}
