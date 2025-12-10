export interface ProductOption {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stockQty: number;
  isDefault: boolean;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  imageType: 'THUMBNAIL' | 'DETAIL' | 'GALLERY';
  sortOrder: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  thumbnailUrl?: string;
  basePrice: number;
  discountRate: number;
  isDiscounted: boolean;
  discountedPrice: number;
  origin?: string;
  storageMethod?: string;
  expirationInfo?: string;
  shippingFee: number;
  shippingMethod?: string;
  shippingRegion?: string;
  notice?: string;
  isOptionRequired: boolean;
  options: ProductOption[];
  images: ProductImage[];
  reviewCount: number;
  averageRating: number;
}
