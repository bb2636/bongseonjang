import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Order, OrderStatus } from './Order';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  previousStatus!: OrderStatus | null;

  @Column({ type: 'varchar', length: 20 })
  newStatus!: OrderStatus;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  changedBy!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;
}
