import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_apply_exposure_categories')
export class CouponApplyExposureCategory {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @PrimaryColumn({ name: 'exposure_category_id', type: 'bigint' })
  exposureCategoryId!: number;

  @ManyToOne('Coupon', 'applyExposureCategories', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
