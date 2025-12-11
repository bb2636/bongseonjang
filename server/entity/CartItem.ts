import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Cart } from './Cart';
import type { Product } from './Product';
import type { ProductMainOption } from './ProductMainOption';
import type { ProductSubOption } from './ProductSubOption';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  cartId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'uuid', nullable: true })
  mainOptionId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  subOptionId!: string | null;

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

  @ManyToOne('ProductMainOption', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'mainOptionId' })
  mainOption!: ProductMainOption | null;

  @ManyToOne('ProductSubOption', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subOptionId' })
  subOption!: ProductSubOption | null;
}
