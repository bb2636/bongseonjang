import type { Notice as NoticeEntity } from '../../../entity';

export interface NoticeRepository {
  findAllForAdmin(keyword?: string): Promise<NoticeEntity[]>;
  findByIdForAdmin(id: number): Promise<NoticeEntity | null>;
  findAll(keyword?: string): Promise<NoticeEntity[]>;
  findById(id: number): Promise<NoticeEntity | null>;
  create(data: { title: string; content: string; typeId: number; isVisible?: boolean }): Promise<NoticeEntity>;
  update(id: number, data: { title?: string; content?: string; typeId?: number; isVisible?: boolean }): Promise<NoticeEntity | null>;
  delete(id: number): Promise<boolean>;
  countAll(): Promise<number>;
  countVisible(): Promise<number>;
}
