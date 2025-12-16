export type InquiryType = 'all' | 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';
export type InquiryStatus = 'pending' | 'answered';
export type SortOrder = 'latest' | 'oldest';

export interface MyInquiry {
  id: string;
  inquiryType: InquiryType;
  inquiryTypeLabel: string;
  productId: string | null;
  productName: string | null;
  productImage: string | null;
  question: string;
  answer: string | null;
  status: InquiryStatus;
  createdAt: string;
  answeredAt: string | null;
}

export interface MyInquiriesResponse {
  inquiries: MyInquiry[];
  total: number;
  page: number;
  limit: number;
}

export const INQUIRY_TYPE_OPTIONS: { value: InquiryType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'product', label: '상품문의' },
  { value: 'shipping', label: '배송문의' },
  { value: 'exchange_return', label: '교환/반품' },
  { value: 'refund', label: '환불문의' },
  { value: 'other', label: '기타문의' },
];

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '과거순' },
];
