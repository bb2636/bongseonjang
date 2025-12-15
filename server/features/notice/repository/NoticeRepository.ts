import type { Notice as NoticeEntity } from '../../../entity';

export interface NoticeRepository {
  findAll(keyword?: string): Promise<NoticeEntity[]>;
  findById(id: number): Promise<NoticeEntity | null>;
  create(data: { title: string; content: string; typeId: number }): Promise<NoticeEntity>;
  update(id: number, data: { title?: string; content?: string; typeId?: number }): Promise<NoticeEntity | null>;
  delete(id: number): Promise<boolean>;
  countVisible(): Promise<number>;
}
