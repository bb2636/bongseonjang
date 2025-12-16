export type InquiryType = 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';

export interface InquiryItem {
  id: number;
  inquiryType: InquiryType;
  productId: string | null;
  productName: string | null;
  question: string;
  answer: string | null;
  isAnswered: boolean;
  createdAt: string;
  answeredAt: string | null;
}

export interface InquiryDetail {
  id: number;
  inquiryType: InquiryType;
  productId: string | null;
  productName: string | null;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface CreateInquiryRequest {
  inquiryType: InquiryType;
  productId?: string;
  question: string;
}

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  product: '상품문의',
  shipping: '배송문의',
  exchange_return: '교환/반품문의',
  refund: '환불문의',
  other: '기타',
};

export const INQUIRY_TYPE_OPTIONS: { value: InquiryType; label: string }[] = [
  { value: 'product', label: '상품문의' },
  { value: 'shipping', label: '배송문의' },
  { value: 'exchange_return', label: '교환/반품문의' },
  { value: 'refund', label: '환불문의' },
  { value: 'other', label: '기타' },
];
