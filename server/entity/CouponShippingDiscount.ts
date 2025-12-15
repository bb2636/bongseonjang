import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_shipping_discounts')
export class CouponShippingDiscount {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @Column({ name: 'is_free_shipping', type: 'boolean', default: false })
  isFreeShipping!: boolean;

  @Column({ name: 'shipping_discount_amount', type: 'int', nullable: true })
  shippingDiscountAmount!: number | null;

  @OneToOne('Coupon', 'shippingDiscount', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
