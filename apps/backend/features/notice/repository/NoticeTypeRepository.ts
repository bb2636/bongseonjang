import type { NoticeType } from '../../../entity';

export interface NoticeTypeRepository {
  findAll(): Promise<NoticeType[]>;
  findById(id: number): Promise<NoticeType | null>;
  findByCode(code: string): Promise<NoticeType | null>;
}
