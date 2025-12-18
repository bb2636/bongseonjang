import { apiClient } from '../../../services';
import { Notice, NoticeCategory } from '../types/notice';

interface NoticeListItemDto {
  id: number;
  title: string;
  typeCode: string;
  typeName: string;
  isVisible: boolean;
  createdAt: string;
}

interface NoticeListResponse {
  notices: NoticeListItemDto[];
  total: number;
}

const DEFAULT_NOTICE_CATEGORY: NoticeCategory = '일반';

function resolveNoticeCategory(typeName: string): NoticeCategory {
  const validCategories: NoticeCategory[] = ['일반', '이벤트', '배송', '점검', '중요'];
  const matchedCategory = validCategories.find((category) => category === typeName);

  if (matchedCategory) {
    return matchedCategory;
  }

  return DEFAULT_NOTICE_CATEGORY;
}

function formatNoticeDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function mapNoticeListItems(notices: NoticeListItemDto[]): Notice[] {
  return notices.map((notice) => ({
    id: notice.id.toString(),
    category: resolveNoticeCategory(notice.typeName || notice.typeCode),
    title: notice.title,
    createdAt: formatNoticeDate(notice.createdAt),
  }));
}

export async function fetchNotices(): Promise<Notice[]> {
  const response = await apiClient.get<NoticeListResponse>('/admin/notices');

  return mapNoticeListItems(response.notices);
}
