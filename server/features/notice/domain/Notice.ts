export interface Notice {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'important' | 'event';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoticeListItem {
  id: number;
  title: string;
  type: 'general' | 'important' | 'event';
  createdAt: string;
}

export interface NoticeListResponse {
  notices: NoticeListItem[];
  total: number;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  type: 'general' | 'important' | 'event';
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  type?: 'general' | 'important' | 'event';
}
