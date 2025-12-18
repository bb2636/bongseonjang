import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_issue_all_users')
export class CouponIssueAllUsers {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @OneToOne('Coupon', 'issueAllUsers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
