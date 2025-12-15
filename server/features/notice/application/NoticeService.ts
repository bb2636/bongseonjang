import type { NoticeRepository } from '../repository/NoticeRepository';
import type { NoticeListResponse, NoticeListItem, CreateNoticeDto, UpdateNoticeDto } from '../domain/Notice';

export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async getNotices(keyword?: string): Promise<NoticeListResponse> {
    const [notices, totalActive] = await Promise.all([
      this.noticeRepository.findAll(keyword),
      this.noticeRepository.countActive(),
    ]);

    const noticeItems: NoticeListItem[] = notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      type: notice.type as 'general' | 'important' | 'event',
      createdAt: notice.createdAt.toISOString(),
    }));

    return {
      notices: noticeItems,
      total: keyword ? notices.length : totalActive,
    };
  }

  async getNoticeById(id: number) {
    const notice = await this.noticeRepository.findById(id);
    if (!notice) {
      return null;
    }

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      type: notice.type,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    };
  }

  async createNotice(dto: CreateNoticeDto) {
    const notice = await this.noticeRepository.create({
      title: dto.title,
      content: dto.content,
      type: dto.type,
    });

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      type: notice.type,
      createdAt: notice.createdAt.toISOString(),
    };
  }

  async updateNotice(id: number, dto: UpdateNoticeDto) {
    const notice = await this.noticeRepository.update(id, {
      title: dto.title,
      content: dto.content,
      type: dto.type,
    });

    if (!notice) {
      return null;
    }

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      type: notice.type,
      updatedAt: notice.updatedAt.toISOString(),
    };
  }

  async deleteNotice(id: number): Promise<boolean> {
    return this.noticeRepository.delete(id);
  }
}
