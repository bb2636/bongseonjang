import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Order } from './Order';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partial_refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'virtual_account' | 'mobile' | 'kakao_pay' | 'naver_pay' | 'toss_pay';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 20 })
  method!: PaymentMethod;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pgProvider!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pgTransactionId!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cardCompany!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cardNumber!: string | null;

  @Column({ type: 'int', nullable: true })
  installmentMonths!: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vbankName!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  vbankNumber!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vbankHolder!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  vbankExpiresAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  failReason!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;
}
