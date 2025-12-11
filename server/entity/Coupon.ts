import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { CouponIssuance } from './CouponIssuance';

export type CouponType = 'fixed' | 'percent';
export type CouponTarget = 'all' | 'category' | 'product' | 'first_order';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 10 })
  discountType!: CouponType;

  @Column({ type: 'int' })
  discountValue!: number;

  @Column({ type: 'int', nullable: true })
  maxDiscountAmount!: number | null;

  @Column({ type: 'int', default: 0 })
  minOrderAmount!: number;

  @Column({ type: 'varchar', length: 20, default: 'all' })
  targetType!: CouponTarget;

  @Column({ type: 'uuid', nullable: true })
  targetId!: string | null;

  @Column({ type: 'int', nullable: true })
  totalQuantity!: number | null;

  @Column({ type: 'int', default: 0 })
  usedQuantity!: number;

  @Column({ type: 'int', default: 1 })
  useLimitPerUser!: number;

  @Column({ type: 'timestamp' })
  validFrom!: Date;

  @Column({ type: 'timestamp' })
  validTo!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany('CouponIssuance', 'coupon')
  issuances!: CouponIssuance[];
}
