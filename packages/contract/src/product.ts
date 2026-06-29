export interface ProductDto {
  id: string;
  name: string;
  basePrice: number;
  lowestPrice: number;
  thumbnailUrl: string | null;
  stockQuantity: number;
  reviewCount: number;
  averageRating: number;
  saleStartDate?: string | null;
  saleEndDate?: string | null;
  countdownDays?: number | null;
}

export interface ProductOptionDto {
  id: number;
  name: string;
  additionalPrice: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductImageDto {
  id: number;
  imageUrl: string;
  imageType: 'thumbnail' | 'detail' | 'additional';
  sortOrder: number;
}

export type ShippingRegion = 'JEJU' | 'ISLAND' | 'JEJU_ISLAND';

export interface ShippingSurchargeDto {
  region: ShippingRegion;
  amount: number;
}

export interface ProductDetailDto {
  id: string;
  name: string;
  basePrice: number;
  lowestPrice: number;
  stockQuantity: number;
  detailContent: string | null;
  saleStartDate: string | null;
  saleEndDate: string | null;
  countdownDays: number | null;
  options: ProductOptionDto[];
  images: ProductImageDto[];
  reviewCount: number;
  averageRating: number;
  shippingPolicy: ShippingPolicyDto | null;
  shippingSurcharges?: ShippingSurchargeDto[];
}

export interface ShippingPolicyDto {
  id: number;
  name: string;
  baseShippingFee: number;
  freeShippingThreshold: number | null;
}

export interface ProductCategoryDto {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface DisplayCategoryDto {
  id: string;
  name: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface ExposureCategoryDto {
  id: number;
  name: string;
  sortOrder: number;
  products: ProductDto[];
}

export type ProductSortBy = 'latest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';

export interface ProductListRequest {
  categoryId?: string;
  exposureCategoryId?: number;
  search?: string;
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: ProductDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
