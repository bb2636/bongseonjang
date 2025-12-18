import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Review } from './Review';

@Entity('review_images')
export class ReviewImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  reviewId!: string;

  @Column({ type: 'text' })
  imageUrl!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('Review', 'images', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review!: Review;
}
