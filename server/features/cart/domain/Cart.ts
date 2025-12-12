export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  mainOptionId: string | null;
  mainOptionName: string | null;
  subOptionId: string | null;
  subOptionName: string | null;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  additionalPrice: number;
  totalPrice: number;
  shippingFee: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  totalShippingFee: number;
  totalAmount: number;
  itemCount: number;
}
