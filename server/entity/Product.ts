import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { ProductCategory } from './ProductCategory';
import type { ShippingPolicy } from './ShippingPolicy';
import type { ProductOption } from './ProductOption';
import type { ProductImage } from './ProductImage';
import type { ProductExposureCategory } from './ProductExposureCategory';
import type { Review } from './Review';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'int', name: 'base_price' })
  basePrice!: number;

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity!: number;

  @Column({ type: 'uuid', name: 'product_category_id' })
  productCategoryId!: string;

  @Column({ type: 'bigint', nullable: true, name: 'shipping_policy_id' })
  shippingPolicyId!: number | null;

  @Column({ type: 'text', nullable: true, name: 'detail_content' })
  detailContent!: string | null;

  @Column({ type: 'date', nullable: true, name: 'sale_start_date' })
  saleStartDate!: Date | null;

  @Column({ type: 'date', nullable: true, name: 'sale_end_date' })
  saleEndDate!: Date | null;

  @Column({ type: 'int', nullable: true, name: 'countdown_days' })
  countdownDays!: number | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('ProductCategory', 'products')
  @JoinColumn({ name: 'product_category_id' })
  productCategory!: ProductCategory;

  @ManyToOne('ShippingPolicy', 'products')
  @JoinColumn({ name: 'shipping_policy_id' })
  shippingPolicy!: ShippingPolicy | null;

  @OneToMany('ProductOption', 'product')
  options!: ProductOption[];

  @OneToMany('ProductImage', 'product')
  images!: ProductImage[];

  @OneToMany('ProductExposureCategory', 'product')
  productExposureCategories!: ProductExposureCategory[];

  @OneToMany('Review', 'product')
  reviews!: Review[];
}
