import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { Product } from './Product';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany('Product', 'productCategory')
  products!: Product[];
}
