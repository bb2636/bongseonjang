import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_issue_new_users')
export class CouponIssueNewUsers {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @OneToOne('Coupon', 'issueNewUsers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
