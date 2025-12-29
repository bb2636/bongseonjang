import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';

@Entity('product_options')
export class ProductOption {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'varchar', length: 100, name: 'option_name' })
  optionName!: string;

  @Column({ type: 'varchar', length: 200, name: 'option_value' })
  optionValue!: string;

  @Column({ type: 'int', nullable: true })
  price!: number | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder!: number;

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne('Product', 'options', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
