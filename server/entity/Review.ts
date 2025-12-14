import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';
import type { User } from './User';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageUrls!: string[] | null;

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
}
