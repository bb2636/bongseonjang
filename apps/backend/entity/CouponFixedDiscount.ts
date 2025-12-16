import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_fixed_discounts')
export class CouponFixedDiscount {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @Column({ name: 'discount_amount', type: 'int' })
  discountAmount!: number;

  @OneToOne('Coupon', 'fixedDiscount', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
