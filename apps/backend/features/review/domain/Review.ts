export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface ReviewStatsDto {
  reviewCount: number;
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
  rating: number;
  content: string;
  imageUrls?: string[];
  orderItemId: string;
}

export interface ReviewableOrderItemDto {
  orderItemId: string;
  productId: string;
  productName: string;
  optionName: string | null;
  productImageUrl: string | null;
  purchaseDate: string;
}

export interface MyReviewDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface UpdateReviewRequest {
  rating: number;
  content: string;
  imageUrls?: string[];
}

export interface CanReviewProductResult {
  canReview: boolean;
  reason?: 'not_purchased' | 'already_reviewed';
  orderItemId?: string;
}
