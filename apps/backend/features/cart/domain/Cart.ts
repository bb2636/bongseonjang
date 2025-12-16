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
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
}
