import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_validity_after_issue_days')
export class CouponValidityAfterIssueDays {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @Column({ name: 'valid_days', type: 'int' })
  validDays!: number;

  @OneToOne('Coupon', 'validityAfterIssueDays', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
