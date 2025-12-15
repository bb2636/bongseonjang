import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_rate_discounts')
export class CouponRateDiscount {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @Column({ name: 'discount_rate', type: 'int' })
  discountRate!: number;

  @Column({ name: 'max_discount_amount', type: 'int', nullable: true })
  maxDiscountAmount!: number | null;

  @OneToOne('Coupon', 'rateDiscount', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
