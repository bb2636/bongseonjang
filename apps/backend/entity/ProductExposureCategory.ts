import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Product } from './Product';
import type { ExposureCategory } from './ExposureCategory';

@Entity('product_exposure_categories')
export class ProductExposureCategory {
  @PrimaryColumn({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @PrimaryColumn({ type: 'bigint', name: 'exposure_category_id' })
  exposureCategoryId!: number;

  @ManyToOne('Product', 'productExposureCategories', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne('ExposureCategory', 'productExposureCategories', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exposure_category_id' })
  exposureCategory!: ExposureCategory;
}
