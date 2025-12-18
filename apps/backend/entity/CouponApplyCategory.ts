import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_apply_categories')
export class CouponApplyCategory {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @PrimaryColumn({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @ManyToOne('Coupon', 'applyCategories', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
