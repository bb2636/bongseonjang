export interface ProductOption {
  id: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
  isDefault: boolean;
}

export interface MainOption {
  id: string;
  groupName: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
  isDefault: boolean;
}

export interface SubOption {
  id: string;
  groupName: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
  isDefault: boolean;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  imageType: 'THUMBNAIL' | 'DETAIL' | 'GALLERY';
  sortOrder: number;
  isThumbnail: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
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
  options: ProductOption[];
  mainOptions: MainOption[];
  subOptions: SubOption[];
  images: ProductImage[];
  reviewCount: number;
  averageRating: number;
}
