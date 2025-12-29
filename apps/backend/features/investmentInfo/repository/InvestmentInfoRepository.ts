import type { InvestmentInfo as InvestmentInfoEntity } from '../../../entity';

export interface InvestmentInfoRepository {
  findAllForAdmin(keyword?: string): Promise<InvestmentInfoEntity[]>;
  findByIdForAdmin(id: number): Promise<InvestmentInfoEntity | null>;
  findAll(keyword?: string): Promise<InvestmentInfoEntity[]>;
  findById(id: number): Promise<InvestmentInfoEntity | null>;
  create(data: { title: string; content: string; typeId: number; isVisible?: boolean }): Promise<InvestmentInfoEntity>;
  update(id: number, data: { title?: string; content?: string; typeId?: number; isVisible?: boolean }): Promise<InvestmentInfoEntity | null>;
  delete(id: number): Promise<boolean>;
  countAll(): Promise<number>;
  countVisible(): Promise<number>;
}
