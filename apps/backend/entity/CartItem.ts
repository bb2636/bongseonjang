import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Cart } from './Cart';
import type { Product } from './Product';
import type { ProductOption } from './ProductOption';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  cartId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'bigint', nullable: true, name: 'product_option_id' })
  productOptionId!: number | null;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Cart', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne('ProductOption', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_option_id' })
  productOption!: ProductOption | null;
}
