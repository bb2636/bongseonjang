import { AppDataSource } from '../../../config/database';
import { NoticeType } from '../../../entity';
import type { NoticeTypeRepository } from './NoticeTypeRepository';

export class TypeORMNoticeTypeRepository implements NoticeTypeRepository {
  private get repository() {
    return AppDataSource.getRepository(NoticeType);
  }

  async findAll(): Promise<NoticeType[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { sortNo: 'ASC' },
    });
  }

  async findById(id: number): Promise<NoticeType | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
    });
  }

  async findByCode(code: string): Promise<NoticeType | null> {
    return this.repository.findOne({
      where: { code, isActive: true },
    });
  }
}
