import type { NoticeRepository } from '../repository/NoticeRepository';
import type { NoticeListResponse, NoticeListItem, CreateNoticeDto, UpdateNoticeDto, NoticeDetailResponse } from '../domain/Notice';

export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async getNoticesForAdmin(keyword?: string): Promise<NoticeListResponse> {
    const [notices, totalAll] = await Promise.all([
      this.noticeRepository.findAllForAdmin(keyword),
      this.noticeRepository.countAll(),
    ]);

    const noticeItems: NoticeListItem[] = notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      typeCode: notice.noticeType?.code ?? '',
      typeName: notice.noticeType?.name ?? '',
      isVisible: notice.isVisible,
      createdAt: notice.createdAt.toISOString(),
    }));

    return {
      notices: noticeItems,
      total: keyword ? notices.length : totalAll,
    };
  }

  async getNotices(keyword?: string): Promise<NoticeListResponse> {
    const [notices, totalVisible] = await Promise.all([
      this.noticeRepository.findAll(keyword),
      this.noticeRepository.countVisible(),
    ]);

    const noticeItems: NoticeListItem[] = notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      typeCode: notice.noticeType?.code ?? '',
      typeName: notice.noticeType?.name ?? '',
      isVisible: notice.isVisible,
      createdAt: notice.createdAt.toISOString(),
    }));

    return {
      notices: noticeItems,
      total: keyword ? notices.length : totalVisible,
    };
  }

  async getNoticeByIdForAdmin(id: number): Promise<NoticeDetailResponse | null> {
    const notice = await this.noticeRepository.findByIdForAdmin(id);
    if (!notice) {
      return null;
    }

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      typeId: notice.typeId,
      typeCode: notice.noticeType?.code ?? '',
      typeName: notice.noticeType?.name ?? '',
      isVisible: notice.isVisible,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    };
  }

  async getNoticeById(id: number): Promise<NoticeDetailResponse | null> {
    const notice = await this.noticeRepository.findById(id);
    if (!notice) {
      return null;
    }

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      typeId: notice.typeId,
      typeCode: notice.noticeType?.code ?? '',
      typeName: notice.noticeType?.name ?? '',
      isVisible: notice.isVisible,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    };
  }

  async createNotice(dto: CreateNoticeDto) {
    const notice = await this.noticeRepository.create({
      title: dto.title,
      content: dto.content,
      typeId: dto.typeId,
      isVisible: dto.isVisible,
    });

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      typeId: notice.typeId,
      isVisible: notice.isVisible,
      createdAt: notice.createdAt.toISOString(),
    };
  }

  async updateNotice(id: number, dto: UpdateNoticeDto) {
    const notice = await this.noticeRepository.update(id, {
      title: dto.title,
      content: dto.content,
      typeId: dto.typeId,
      isVisible: dto.isVisible,
    });

    if (!notice) {
      return null;
    }

    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      typeId: notice.typeId,
      isVisible: notice.isVisible,
      updatedAt: notice.updatedAt.toISOString(),
    };
  }

  async deleteNotice(id: number): Promise<boolean> {
    return this.noticeRepository.delete(id);
  }
}
