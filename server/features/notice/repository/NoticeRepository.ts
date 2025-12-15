import type { Notice as NoticeEntity } from '../../../entity';

export interface NoticeRepository {
  findAll(keyword?: string): Promise<NoticeEntity[]>;
  findById(id: number): Promise<NoticeEntity | null>;
  create(data: { title: string; content: string; type: string }): Promise<NoticeEntity>;
  update(id: number, data: { title?: string; content?: string; type?: string }): Promise<NoticeEntity | null>;
  delete(id: number): Promise<boolean>;
  countActive(): Promise<number>;
}
