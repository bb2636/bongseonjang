import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Coupon } from './Coupon';

export type UserCouponStatus = 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED';

@Entity('user_coupons')
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'coupon_id', type: 'int' })
  couponId!: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: 'ISSUED' })
  status!: UserCouponStatus;

  @Column({ name: 'issued_at', type: 'timestamp', nullable: true })
  issuedAt!: Date;

  @Column({ name: 'valid_from', type: 'timestamp', nullable: true })
  validFrom!: Date | null;

  @Column({ name: 'valid_to', type: 'timestamp', nullable: true })
  validTo!: Date | null;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt!: Date | null;

  @Column({ name: 'used_order_id', type: 'uuid', nullable: true })
  usedOrderId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Coupon', 'userCoupons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
