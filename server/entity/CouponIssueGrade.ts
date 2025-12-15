import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

@Entity('coupon_issue_grades')
export class CouponIssueGrade {
  @PrimaryColumn({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @PrimaryColumn({ name: 'grade_id', type: 'int' })
  gradeId!: number;

  @ManyToOne('Coupon', 'issueGrades', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
