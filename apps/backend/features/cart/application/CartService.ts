import { CartRepository } from '../repository/CartRepository';
import { CartDto, CartItemDto } from '../domain/Cart';

export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(userId: string): Promise<CartDto> {
    return this.cartRepository.getCart(userId);
  }

  async addItem(
    userId: string,
    productId: string,
    productOptionId: number | null,
    quantity: number
  ): Promise<CartItemDto> {
    return this.cartRepository.addItem(userId, productId, productOptionId, quantity);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItemDto | null> {
    return this.cartRepository.updateItemQuantity(userId, itemId, quantity);
  }

  async removeItem(userId: string, itemId: string): Promise<boolean> {
    return this.cartRepository.removeItem(userId, itemId);
  }

  async removeItems(userId: string, itemIds: string[]): Promise<number> {
    return this.cartRepository.removeItems(userId, itemIds);
  }

  async clearCart(userId: string): Promise<boolean> {
    return this.cartRepository.clearCart(userId);
  }
}
