import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { PointWallet } from './PointWallet';
import type { Order } from './Order';

export type PointTransactionType = 'earn' | 'use' | 'expire' | 'refund' | 'admin_add' | 'admin_deduct';

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  walletId!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: PointTransactionType;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'int' })
  balanceAfter!: number;

  @Column({ type: 'varchar', length: 200 })
  description!: string;

  @Column({ type: 'uuid', nullable: true })
  relatedOrderId!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('PointWallet', 'transactions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet!: PointWallet;

  @ManyToOne('Order', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'relatedOrderId' })
  relatedOrder!: Order | null;
}
