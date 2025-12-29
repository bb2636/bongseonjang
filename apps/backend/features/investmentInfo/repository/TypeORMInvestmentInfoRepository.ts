import { AppDataSource } from '../../../config/database';
import { InvestmentInfo } from '../../../entity';
import type { InvestmentInfoRepository } from './InvestmentInfoRepository';

export class TypeORMInvestmentInfoRepository implements InvestmentInfoRepository {
  private get repository() {
    return AppDataSource.getRepository(InvestmentInfo);
  }

  async findAllForAdmin(keyword?: string): Promise<InvestmentInfo[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('investmentInfo')
      .leftJoinAndSelect('investmentInfo.investmentInfoType', 'investmentInfoType')
      .orderBy('investmentInfo.createdAt', 'DESC');

    if (keyword) {
      queryBuilder.andWhere('investmentInfo.title ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    return queryBuilder.getMany();
  }

  async findByIdForAdmin(id: number): Promise<InvestmentInfo | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['investmentInfoType'],
    });
  }

  async findAll(keyword?: string): Promise<InvestmentInfo[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('investmentInfo')
      .leftJoinAndSelect('investmentInfo.investmentInfoType', 'investmentInfoType')
      .where('investmentInfo.isVisible = :isVisible', { isVisible: true })
      .orderBy('investmentInfo.createdAt', 'DESC');

    if (keyword) {
      queryBuilder.andWhere('investmentInfo.title ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    return queryBuilder.getMany();
  }

  async findById(id: number): Promise<InvestmentInfo | null> {
    return this.repository.findOne({
      where: { id, isVisible: true },
      relations: ['investmentInfoType'],
    });
  }

  async create(data: { title: string; content: string; typeId: number; isVisible?: boolean }): Promise<InvestmentInfo> {
    const investmentInfo = this.repository.create({
      title: data.title,
      content: data.content,
      typeId: data.typeId,
      isVisible: data.isVisible ?? true,
    });
    return this.repository.save(investmentInfo);
  }

  async update(id: number, data: { title?: string; content?: string; typeId?: number; isVisible?: boolean }): Promise<InvestmentInfo | null> {
    const investmentInfo = await this.repository.findOne({ where: { id } });
    if (!investmentInfo) {
      return null;
    }

    if (data.title !== undefined) investmentInfo.title = data.title;
    if (data.content !== undefined) investmentInfo.content = data.content;
    if (data.typeId !== undefined) investmentInfo.typeId = data.typeId;
    if (data.isVisible !== undefined) investmentInfo.isVisible = data.isVisible;

    return this.repository.save(investmentInfo);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async countAll(): Promise<number> {
    return this.repository.count();
  }

  async countVisible(): Promise<number> {
    return this.repository.count({ where: { isVisible: true } });
  }
}
