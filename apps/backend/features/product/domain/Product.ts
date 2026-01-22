export interface ProductDto {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  isFavorite?: boolean;
  summary?: string;
  origin?: string;
  reviewCount?: number;
  averageRating?: number;
  mainOptions?: MainOptionDto[];
}

export interface TimeDealProductDto extends ProductDto {
  saleEndAt: string;
  remainingSeconds: number;
}

export interface ProductOptionDto {
  id: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
  isDefault: boolean;
}

export interface MainOptionDto {
  id: string;
  groupName: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
  isDefault: boolean;
}

export interface SubOptionDto {
  id: string;
  groupName: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
  isDefault: boolean;
}

export interface ProductImageDto {
  id: string;
  imageUrl: string;
  imageType: 'THUMBNAIL' | 'DETAIL' | 'GALLERY';
  sortOrder: number;
}

export interface ProductDetailDto {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  thumbnailUrl?: string;
  basePrice: number;
  discountRate: number;
  isDiscounted: boolean;
  discountedPrice: number;
  lowestPrice: number;
  origin?: string;
  storageMethod?: string;
  expirationInfo?: string;
  shippingMethod?: string;
  shippingRegion?: string;
  notice?: string;
  isOptionRequired: boolean;
  saleStartAt?: string;
  saleEndAt?: string;
  options: ProductOptionDto[];
  mainOptions: MainOptionDto[];
  subOptions: SubOptionDto[];
  images: ProductImageDto[];
  reviewCount: number;
  averageRating: number;
  stockQuantity: number;
  productCategoryId?: number | null;
  exposureCategoryIds?: number[];
}
