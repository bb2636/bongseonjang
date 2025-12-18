export type InquiryType = 'product' | 'order' | 'all';
export type InquiryStatus = 'pending' | 'answered';
export type SortOrder = 'latest' | 'oldest';

export interface ProductInquiryDto {
  id: string;
  productId: string;
  productName: string;
  productThumbnail: string | null;
  userId: string;
  userName: string;
  title: string;
  content: string;
  imageUrls: string[];
  isSecret: boolean;
  status: InquiryStatus;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInquiryRequest {
  productId: string;
  title: string;
  content: string;
  imageUrls?: string[];
  isSecret?: boolean;
}

export interface CreateProductInquiryResponse {
  success: boolean;
  inquiryId: string;
  message?: string;
}

export interface ProductInquiryListRequest {
  productId?: string;
  userId?: string;
  status?: InquiryStatus;
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
}

export interface ProductInquiryListResponse {
  inquiries: ProductInquiryDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MyInquiriesRequest {
  type?: InquiryType;
  status?: InquiryStatus;
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
}

export interface MyInquiriesResponse {
  inquiries: ProductInquiryDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AnswerInquiryRequest {
  answer: string;
}

export interface AnswerInquiryResponse {
  success: boolean;
  message?: string;
}
