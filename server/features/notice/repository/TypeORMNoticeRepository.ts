import { AppDataSource } from '../../../config/database';
import { Notice, NoticeType } from '../../../entity';
import type { NoticeRepository } from './NoticeRepository';

export class TypeORMNoticeRepository implements NoticeRepository {
  private get repository() {
    return AppDataSource.getRepository(Notice);
  }

  async findAll(keyword?: string): Promise<Notice[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('notice')
      .where('notice.isActive = :isActive', { isActive: true })
      .orderBy('notice.createdAt', 'DESC');

    if (keyword) {
      queryBuilder.andWhere('notice.title ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    return queryBuilder.getMany();
  }

  async findById(id: number): Promise<Notice | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
    });
  }

  async create(data: { title: string; content: string; type: string }): Promise<Notice> {
    const notice = this.repository.create({
      title: data.title,
      content: data.content,
      type: data.type as NoticeType,
      isActive: true,
    });
    return this.repository.save(notice);
  }

  async update(id: number, data: { title?: string; content?: string; type?: string }): Promise<Notice | null> {
    const notice = await this.findById(id);
    if (!notice) {
      return null;
    }

    if (data.title !== undefined) {
      notice.title = data.title;
    }
    if (data.content !== undefined) {
      notice.content = data.content;
    }
    if (data.type !== undefined) {
      notice.type = data.type as NoticeType;
    }

    return this.repository.save(notice);
  }

  async delete(id: number): Promise<boolean> {
    const notice = await this.findById(id);
    if (!notice) {
      return false;
    }

    notice.isActive = false;
    await this.repository.save(notice);
    return true;
  }

  async countActive(): Promise<number> {
    return this.repository.count({
      where: { isActive: true },
    });
  }
}
