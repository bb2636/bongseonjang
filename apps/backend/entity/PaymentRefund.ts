import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Payment } from './Payment';

export type RefundStatus = 'pending' | 'completed' | 'failed';

@Entity('payment_refunds')
export class PaymentRefund {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  paymentId!: string;

  @Column({ type: 'int' })
  refundAmount!: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: RefundStatus;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pgRefundId!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Payment', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paymentId' })
  payment!: Payment;
}
