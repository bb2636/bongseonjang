import type { InvestmentInfoType } from '../../../entity';

export interface InvestmentInfoTypeRepository {
  findAll(): Promise<InvestmentInfoType[]>;
  findById(id: number): Promise<InvestmentInfoType | null>;
  findByCode(code: string): Promise<InvestmentInfoType | null>;
}
