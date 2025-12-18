export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userProfileImage: string | null;
  rating: number;
  content: string;
  images: ReviewImageDto[];
  optionName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewImageDto {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface ReviewStatsDto {
  totalCount: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewRequest {
  productId: string;
  orderItemId: string;
  rating: number;
  content: string;
  imageUrls?: string[];
}

export interface CreateReviewResponse {
  success: boolean;
  reviewId: string;
  message?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  imageUrls?: string[];
}

export interface UpdateReviewResponse {
  success: boolean;
  message?: string;
}

export interface ReviewListRequest {
  productId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'rating_high' | 'rating_low';
}

export interface ReviewListResponse {
  reviews: ReviewDto[];
  stats: ReviewStatsDto;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MyReviewDto extends ReviewDto {
  productName: string;
  productThumbnail: string | null;
}

export interface ReviewableOrderItemDto {
  orderItemId: string;
  productId: string;
  productName: string;
  productThumbnail: string | null;
  optionName: string | null;
  orderedAt: string;
}
