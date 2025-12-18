import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { Product } from './Product';
import type { User } from './User';
import type { ReviewImage } from './ReviewImage';
import type { OrderItem } from './OrderItem';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  orderItemId!: string | null;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Product', 'reviews')
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne('User', 'reviews')
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne('OrderItem', { nullable: true })
  @JoinColumn({ name: 'orderItemId' })
  orderItem!: OrderItem | null;

  @OneToMany('ReviewImage', 'review')
  images!: ReviewImage[];
}
