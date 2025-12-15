import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';
import type { User } from './User';

@Entity('product_inquiries')
export class ProductInquiry {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'boolean', default: false, name: 'is_answered' })
  isAnswered!: boolean;

  @Column({ type: 'text', nullable: true })
  answer!: string | null;

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
  product!: Product;

  @ManyToOne('User', 'productInquiries')
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne('User')
  @JoinColumn({ name: 'answered_by' })
  answerer!: User | null;
}
