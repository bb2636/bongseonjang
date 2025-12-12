import { CartRepository } from './CartRepository';
import { CartDto, CartItemDto } from '../domain/Cart';
import { AppDataSource } from '../../../config/database';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { ProductImage } from '../../../entity/ProductImage';
import { In } from 'typeorm';

const DEFAULT_SHIPPING_FEE = 3000;
const FREE_SHIPPING_THRESHOLD = 50000;

export class RealCartRepository implements CartRepository {
  private async getOrCreateCart(userId: string): Promise<Cart> {
    const cartRepository = AppDataSource.getRepository(Cart);
    
    let cart = await cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['items'],
    });

    if (!cart) {
      cart = cartRepository.create({
        userId,
        isActive: true,
        items: [],
      });
      await cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string): Promise<CartDto> {
    const cart = await this.getOrCreateCart(userId);
    
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const items = await cartItemRepository.find({
      where: { cartId: cart.id },
      relations: ['product', 'mainOption', 'subOption'],
      order: { createdAt: 'DESC' },
    });

    const productIds = items.map(item => item.productId);
    const productImages = await this.getProductThumbnails(productIds);

    const cartItems: CartItemDto[] = items.map(item => {
      const basePrice = item.mainOption?.price ?? item.product?.basePrice ?? 0;
      const additionalPrice = item.subOption?.additionalPrice ?? 0;
      const unitPrice = basePrice + additionalPrice;
      const compareAtPrice = item.mainOption?.compareAtPrice ?? null;
      const totalPrice = unitPrice * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? '',
        productImageUrl: productImages.get(item.productId) ?? 'https://placehold.co/58x58/f5f5f5/999999?text=No+Image',
        mainOptionId: item.mainOptionId,
        mainOptionName: item.mainOption ? `${item.mainOption.name}` : null,
        subOptionId: item.subOptionId,
        subOptionName: item.subOption?.name ?? null,
        quantity: item.quantity,
        unitPrice,
        compareAtPrice,
        additionalPrice,
        totalPrice,
        shippingFee: DEFAULT_SHIPPING_FEE,
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (cartItems.length > 0 ? DEFAULT_SHIPPING_FEE : 0);
    const totalAmount = subtotal + totalShippingFee;

    return {
      id: cart.id,
      items: cartItems,
      subtotal,
      totalShippingFee,
      totalAmount,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addItem(
    userId: string,
    productId: string,
    mainOptionId: string | null,
    subOptionId: string | null,
    quantity: number
  ): Promise<CartItemDto> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    let existingItem = await cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId,
        mainOptionId: mainOptionId ?? undefined,
        subOptionId: subOptionId ?? undefined,
      },
      relations: ['product', 'mainOption', 'subOption'],
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await cartItemRepository.save(existingItem);
    } else {
      existingItem = cartItemRepository.create({
        cartId: cart.id,
        productId,
        mainOptionId,
        subOptionId,
        quantity,
      });
      await cartItemRepository.save(existingItem);
      
      existingItem = await cartItemRepository.findOne({
        where: { id: existingItem.id },
        relations: ['product', 'mainOption', 'subOption'],
      });
    }

    if (!existingItem) {
      throw new Error('Failed to create cart item');
    }

    const productImages = await this.getProductThumbnails([productId]);
    const basePrice = existingItem.mainOption?.price ?? existingItem.product?.basePrice ?? 0;
    const additionalPrice = existingItem.subOption?.additionalPrice ?? 0;
    const unitPrice = basePrice + additionalPrice;

    return {
      id: existingItem.id,
      productId: existingItem.productId,
      productName: existingItem.product?.name ?? '',
      productImageUrl: productImages.get(productId) ?? 'https://placehold.co/58x58/f5f5f5/999999?text=No+Image',
      mainOptionId: existingItem.mainOptionId,
      mainOptionName: existingItem.mainOption?.name ?? null,
      subOptionId: existingItem.subOptionId,
      subOptionName: existingItem.subOption?.name ?? null,
      quantity: existingItem.quantity,
      unitPrice,
      compareAtPrice: existingItem.mainOption?.compareAtPrice ?? null,
      additionalPrice,
      totalPrice: unitPrice * existingItem.quantity,
      shippingFee: DEFAULT_SHIPPING_FEE,
    };
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItemDto | null> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const item = await cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product', 'mainOption', 'subOption'],
    });

    if (!item) {
      return null;
    }

    if (quantity <= 0) {
      await cartItemRepository.remove(item);
      return null;
    }

    item.quantity = quantity;
    await cartItemRepository.save(item);

    const productImages = await this.getProductThumbnails([item.productId]);
    const basePrice = item.mainOption?.price ?? item.product?.basePrice ?? 0;
    const additionalPrice = item.subOption?.additionalPrice ?? 0;
    const unitPrice = basePrice + additionalPrice;

    return {
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? '',
      productImageUrl: productImages.get(item.productId) ?? 'https://placehold.co/58x58/f5f5f5/999999?text=No+Image',
      mainOptionId: item.mainOptionId,
      mainOptionName: item.mainOption?.name ?? null,
      subOptionId: item.subOptionId,
      subOptionName: item.subOption?.name ?? null,
      quantity: item.quantity,
      unitPrice,
      compareAtPrice: item.mainOption?.compareAtPrice ?? null,
      additionalPrice,
      totalPrice: unitPrice * item.quantity,
      shippingFee: DEFAULT_SHIPPING_FEE,
    };
  }

  async removeItem(userId: string, itemId: string): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const item = await cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return false;
    }

    await cartItemRepository.remove(item);
    return true;
  }

  async removeItems(userId: string, itemIds: string[]): Promise<number> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const items = await cartItemRepository.find({
      where: { id: In(itemIds), cartId: cart.id },
    });

    if (items.length === 0) {
      return 0;
    }

    await cartItemRepository.remove(items);
    return items.length;
  }

  async clearCart(userId: string): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    await cartItemRepository.delete({ cartId: cart.id });
    return true;
  }

  private async getProductThumbnails(productIds: string[]): Promise<Map<string, string>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const imageRepository = AppDataSource.getRepository(ProductImage);
    const images = await imageRepository.find({
      where: { productId: In(productIds), isThumbnail: true },
    });

    const imageMap = new Map<string, string>();
    for (const image of images) {
      imageMap.set(image.productId, image.imageUrl);
    }

    return imageMap;
  }
}
