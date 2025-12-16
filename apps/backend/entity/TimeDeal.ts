import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';

@Entity('time_deals')
export class TimeDeal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int' })
  discountRate!: number;

  @Column({ type: 'int' })
  dealPrice!: number;

  @Column({ type: 'timestamp' })
  startAt!: Date;

  @Column({ type: 'timestamp' })
  endAt!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
