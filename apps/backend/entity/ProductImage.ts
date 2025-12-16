import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';

export enum ImageType {
  THUMBNAIL = 'THUMBNAIL',
  DETAIL = 'DETAIL',
  GALLERY = 'GALLERY'
}

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ type: 'enum', enum: ImageType })
  imageType!: ImageType;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: false })
  isThumbnail!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('Product', 'images', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
