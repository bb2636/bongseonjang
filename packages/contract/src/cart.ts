export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productOptionId: number | null;
  productOptionName: string | null;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  totalPrice: number;
  isAvailable?: boolean;
  stockQuantity?: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  estimatedShippingFee?: number;
  estimatedTotal?: number;
}

export interface AddToCartRequest {
  productId: string;
  productOptionId?: number | null;
  quantity?: number;
}

export interface AddToCartResponse {
  success: boolean;
  cartItemId: string;
  message?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  success: boolean;
  message?: string;
}

export interface RemoveCartItemResponse {
  success: boolean;
  message?: string;
}
