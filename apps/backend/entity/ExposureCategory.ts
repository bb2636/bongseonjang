import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { ProductExposureCategory } from './ProductExposureCategory';

@Entity('exposure_categories')
export class ExposureCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder!: number;

  @OneToMany('ProductExposureCategory', 'exposureCategory')
  productExposureCategories!: ProductExposureCategory[];
}
