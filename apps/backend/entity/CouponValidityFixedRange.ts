import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_validity_fixed_ranges')
export class CouponValidityFixedRange {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @Column({ name: 'start_at', type: 'timestamp' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamp' })
  endAt!: Date;

  @OneToOne('Coupon', 'validityFixedRange', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
