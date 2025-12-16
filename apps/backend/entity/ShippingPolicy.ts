import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { Product } from './Product';

@Entity('shipping_policies')
export class ShippingPolicy {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'int', name: 'shipping_fee' })
  shippingFee!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany('Product', 'shippingPolicy')
  products!: Product[];
}
