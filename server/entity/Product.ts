import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { ProductCategory } from './ProductCategory';
import type { DisplayCategory } from './DisplayCategory';
import type { ProductOption } from './ProductOption';
import type { ProductImage } from './ProductImage';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productCategoryId!: string;

  @Column({ type: 'uuid' })
  displayCategoryId!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  summary!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'int' })
  basePrice!: number;

  @Column({ type: 'int', default: 0 })
  discountRate!: number;

  @Column({ type: 'boolean', default: false })
  isDiscounted!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origin!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  storageMethod!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  expirationInfo!: string | null;

  @Column({ type: 'int', default: 0 })
  shippingFee!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shippingMethod!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  shippingRegion!: string | null;

  @Column({ type: 'text', nullable: true })
  notice!: string | null;

  @Column({ type: 'boolean', default: false })
  isOptionRequired!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  saleStartAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  saleEndAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('ProductCategory', 'products')
  @JoinColumn({ name: 'productCategoryId' })
  productCategory!: ProductCategory;

  @ManyToOne('DisplayCategory', 'products')
  @JoinColumn({ name: 'displayCategoryId' })
  displayCategory!: DisplayCategory;

  @OneToMany('ProductOption', 'product')
  options!: ProductOption[];

  @OneToMany('ProductImage', 'product')
  images!: ProductImage[];
}
