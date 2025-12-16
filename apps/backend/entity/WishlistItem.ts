import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import type { Wishlist } from './Wishlist';
import type { Product } from './Product';

@Entity('wishlist_items')
@Unique(['wishlistId', 'productId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  wishlistId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('Wishlist', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlistId' })
  wishlist!: Wishlist;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
