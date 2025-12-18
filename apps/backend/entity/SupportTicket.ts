import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { User } from './User';
import type { Order } from './Order';
import type { SupportMessage } from './SupportMessage';

export type TicketCategory = 'order' | 'delivery' | 'refund' | 'product' | 'account' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  ticketNumber!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  orderId!: string | null;

  @Column({ type: 'varchar', length: 20 })
  category!: TicketCategory;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status!: TicketStatus;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne('Order', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'orderId' })
  order!: Order | null;

  @OneToMany('SupportMessage', 'ticket')
  messages!: SupportMessage[];
}
