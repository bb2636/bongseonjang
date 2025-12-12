import { CartDto, CartItemDto } from '../domain/Cart';

export interface CartRepository {
  getCart(userId: string): Promise<CartDto>;
  addItem(userId: string, productId: string, mainOptionId: string | null, subOptionId: string | null, quantity: number): Promise<CartItemDto>;
  updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItemDto | null>;
  removeItem(userId: string, itemId: string): Promise<boolean>;
  removeItems(userId: string, itemIds: string[]): Promise<number>;
  clearCart(userId: string): Promise<boolean>;
}
