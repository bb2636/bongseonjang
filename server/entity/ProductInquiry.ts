import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';
import type { User } from './User';

export type InquiryType = 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';

@Entity('product_inquiries')
export class ProductInquiry {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 20, name: 'inquiry_type', default: 'product' })
  inquiryType!: InquiryType;

  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId!: string | null;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'text', nullable: true })
  answer!: string | null;

  @Column({ type: 'boolean', name: 'is_private', default: false })
  isPrivate!: boolean;

  @Column({ type: 'text', name: 'image_urls', array: true, default: () => 'ARRAY[]::text[]' })
  imageUrls!: string[];

  @Column({ type: 'timestamptz', nullable: true, name: 'answered_at' })
  answeredAt!: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'answered_by' })
  answeredBy!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('Product', 'inquiries')
  @JoinColumn({ name: 'product_id' })
  product!: Product | null;

  @ManyToOne('User', 'productInquiries')
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne('User')
  @JoinColumn({ name: 'answered_by' })
  answerer!: User | null;

  get isAnswered(): boolean {
    return this.answer !== null;
  }
}
