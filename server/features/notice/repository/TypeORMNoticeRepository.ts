import { AppDataSource } from '../../../config/database';
import { Notice } from '../../../entity';
import type { NoticeRepository } from './NoticeRepository';

export class TypeORMNoticeRepository implements NoticeRepository {
  private get repository() {
    return AppDataSource.getRepository(Notice);
  }

  async findAll(keyword?: string): Promise<Notice[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.noticeType', 'noticeType')
      .where('notice.isVisible = :isVisible', { isVisible: true })
      .orderBy('notice.createdAt', 'DESC');

    if (keyword) {
      queryBuilder.andWhere('notice.title ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    return queryBuilder.getMany();
  }

  async findById(id: number): Promise<Notice | null> {
    return this.repository.findOne({
      where: { id, isVisible: true },
      relations: ['noticeType'],
    });
  }

  async create(data: { title: string; content: string; typeId: number }): Promise<Notice> {
    const notice = this.repository.create({
      title: data.title,
      content: data.content,
      typeId: data.typeId,
      isVisible: true,
    });
    return this.repository.save(notice);
  }

  async update(id: number, data: { title?: string; content?: string; typeId?: number }): Promise<Notice | null> {
    const notice = await this.findById(id);
    if (!notice) {
      return null;
    }

    const updateData: Partial<Notice> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.typeId !== undefined) {
      updateData.typeId = data.typeId;
    }

    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const notice = await this.findById(id);
    if (!notice) {
      return false;
    }

    notice.isVisible = false;
    await this.repository.save(notice);
    return true;
  }

  async countVisible(): Promise<number> {
    return this.repository.count({
      where: { isVisible: true },
    });
  }
}
