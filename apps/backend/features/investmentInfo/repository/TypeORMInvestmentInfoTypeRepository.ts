import { AppDataSource } from '../../../config/database';
import { InvestmentInfoType } from '../../../entity';
import type { InvestmentInfoTypeRepository } from './InvestmentInfoTypeRepository';

export class TypeORMInvestmentInfoTypeRepository implements InvestmentInfoTypeRepository {
  private get repository() {
    return AppDataSource.getRepository(InvestmentInfoType);
  }

  async findAll(): Promise<InvestmentInfoType[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { sortNo: 'ASC' },
    });
  }

  async findById(id: number): Promise<InvestmentInfoType | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
    });
  }

  async findByCode(code: string): Promise<InvestmentInfoType | null> {
    return this.repository.findOne({
      where: { code, isActive: true },
    });
  }
}
