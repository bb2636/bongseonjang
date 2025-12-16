import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_apply_all_products')
export class CouponApplyAllProducts {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @OneToOne('Coupon', 'applyAllProducts', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
