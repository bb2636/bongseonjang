export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productThumbnail: string | null;
  optionId: number | null;
  optionName: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  estimatedShippingFee: number;
  estimatedTotal: number;
}

export interface AddToCartRequest {
  productId: string;
  optionId?: number;
  quantity: number;
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
