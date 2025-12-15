export type InquiryType = 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';

export interface InquiryListItem {
  id: number;
  inquiryType: InquiryType;
  productId: string | null;
  productName: string | null;
  authorId: string;
  authorName: string;
  authorPhone: string | null;
  question: string;
  isAnswered: boolean;
  createdAt: Date;
}

export interface InquiryDetail {
  id: number;
  inquiryType: InquiryType;
  productId: string | null;
  productName: string | null;
  authorId: string;
  authorName: string;
  authorPhone: string | null;
  question: string;
  answer: string | null;
  answeredAt: Date | null;
  answeredBy: string | null;
  answererName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InquiryFilter {
  keyword?: string;
  inquiryType?: InquiryType | 'all';
  status?: 'all' | 'answered' | 'unanswered';
  page?: number;
  limit?: number;
}

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  product: '상품문의',
  shipping: '배송문의',
  exchange_return: '교환반품문의',
  refund: '환불문의',
  other: '기타',
};
