export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface SuccessResponse<T = void> {
  success: true;
  data: T;
  message?: string;
}

export interface UploadSignedUrlRequest {
  filename: string;
  contentType: string;
  purpose: UploadPurpose;
}

export interface UploadSignedUrlResponse {
  signedUrl: string;
  publicUrl: string;
  expiresAt: string;
}

export type UploadPurpose = 
  | 'profile'
  | 'product'
  | 'review'
  | 'inquiry'
  | 'banner'
  | 'category';

export interface FaqCategoryDto {
  id: string;
  name: string;
  sortOrder: number;
}

export interface FaqDto {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FaqListRequest {
  categoryId?: string;
}

export interface FaqListResponse {
  categories: FaqCategoryDto[];
  faqs: FaqDto[];
}

export type NoticeType = 'GENERAL' | 'EVENT' | 'SYSTEM' | 'IMPORTANT';

export interface NoticeDto {
  id: string;
  type: NoticeType;
  title: string;
  content: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeListRequest {
  type?: NoticeType;
  page?: number;
  limit?: number;
}

export interface NoticeListResponse {
  notices: NoticeDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WishlistItemDto {
  id: string;
  productId: string;
  product: import('./product.js').ProductDto;
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItemDto[];
  total: number;
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface AddToWishlistResponse {
  success: boolean;
  wishlistItemId: string;
  message?: string;
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message?: string;
}
