interface SoldOutCheckableProduct {
  imageUrl?: string;
  thumbnailUrl?: string;
  discountedPrice?: number;
  originalPrice?: number;
  basePrice?: number;
  stockQuantity?: number;
  saleStartAt?: string | null;
  saleEndAt?: string | null;
  mainOptions?: Array<{ stockQty: number }>;
  options?: Array<{ stockQty: number }>;
  images?: Array<{ imageType?: string }>;
}

export function checkProductSoldOut(product: SoldOutCheckableProduct): boolean {
  const hasImage = product.imageUrl
    || product.thumbnailUrl
    || (product.images && product.images.length > 0);
  if (!hasImage) return true;

  const effectivePrice = product.discountedPrice ?? product.originalPrice ?? product.basePrice ?? 0;
  if (effectivePrice <= 0) return true;

  const now = new Date();
  if (product.saleStartAt && new Date(product.saleStartAt) > now) return true;
  if (product.saleEndAt && new Date(product.saleEndAt) < now) return true;

  const optionsList = product.mainOptions ?? product.options;
  if (optionsList && optionsList.length > 0) {
    return optionsList.every(option => option.stockQty === 0);
  }

  if (product.stockQuantity !== undefined && product.stockQuantity !== null) {
    return product.stockQuantity === 0;
  }

  return false;
}
