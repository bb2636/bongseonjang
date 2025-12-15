export interface NoticeTypeInfo {
  id: number;
  code: string;
  name: string;
}

export interface Notice {
  id: number;
  typeId: number;
  title: string;
  content: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  noticeType?: NoticeTypeInfo;
}

export interface NoticeListItem {
  id: number;
  title: string;
  typeCode: string;
  typeName: string;
  createdAt: string;
}

export interface NoticeListResponse {
  notices: NoticeListItem[];
  total: number;
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  typeId: number;
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  typeId?: number;
}

export interface NoticeDetailResponse {
  id: number;
  title: string;
  content: string;
  typeId: number;
  typeCode: string;
  typeName: string;
  createdAt: string;
  updatedAt: string;
}
