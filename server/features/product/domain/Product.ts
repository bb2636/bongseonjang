export interface ProductDto {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
}

export interface ProductOptionDto {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stockQty: number;
  isDefault: boolean;
}

export interface MainOptionDto {
  id: string;
  groupName: string;
  name: string;
  price: number;
  compareAtPrice?: number;
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
  shippingFee: number;
  shippingMethod?: string;
  shippingRegion?: string;
  notice?: string;
  isOptionRequired: boolean;
  options: ProductOptionDto[];
  mainOptions: MainOptionDto[];
  subOptions: SubOptionDto[];
  images: ProductImageDto[];
  reviewCount: number;
  averageRating: number;
}
