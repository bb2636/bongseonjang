import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import type { CouponFixedDiscount } from './CouponFixedDiscount';
import type { CouponRateDiscount } from './CouponRateDiscount';
import type { CouponShippingDiscount } from './CouponShippingDiscount';
import type { CouponValidityFixedRange } from './CouponValidityFixedRange';
import type { CouponValidityAfterIssueDays } from './CouponValidityAfterIssueDays';
import type { CouponApplyAllProducts } from './CouponApplyAllProducts';
import type { CouponApplyCategory } from './CouponApplyCategory';
import type { CouponIssueAllUsers } from './CouponIssueAllUsers';
import type { CouponIssueNewUsers } from './CouponIssueNewUsers';
import type { CouponIssueGrade } from './CouponIssueGrade';
import type { UserCoupon } from './UserCoupon';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'min_order_amount', type: 'int', default: 0 })
  minOrderAmount!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToOne('CouponFixedDiscount', 'coupon')
  fixedDiscount!: CouponFixedDiscount | null;

  @OneToOne('CouponRateDiscount', 'coupon')
  rateDiscount!: CouponRateDiscount | null;

  @OneToOne('CouponShippingDiscount', 'coupon')
  shippingDiscount!: CouponShippingDiscount | null;

  @OneToOne('CouponValidityFixedRange', 'coupon')
  validityFixedRange!: CouponValidityFixedRange | null;

  @OneToOne('CouponValidityAfterIssueDays', 'coupon')
  validityAfterIssueDays!: CouponValidityAfterIssueDays | null;

  @OneToOne('CouponApplyAllProducts', 'coupon')
  applyAllProducts!: CouponApplyAllProducts | null;

  @OneToMany('CouponApplyCategory', 'coupon')
  applyCategories!: CouponApplyCategory[];

  @OneToOne('CouponIssueAllUsers', 'coupon')
  issueAllUsers!: CouponIssueAllUsers | null;

  @OneToOne('CouponIssueNewUsers', 'coupon')
  issueNewUsers!: CouponIssueNewUsers | null;

  @OneToMany('CouponIssueGrade', 'coupon')
  issueGrades!: CouponIssueGrade[];

  @OneToMany('UserCoupon', 'coupon')
  userCoupons!: UserCoupon[];
}
