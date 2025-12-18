export type NoticeCategory = '일반' | '이벤트' | '배송' | '점검' | '중요';

export interface Notice {
  id: string;
  category: NoticeCategory;
  title: string;
  createdAt: string;
}
