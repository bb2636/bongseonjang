import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import type { Order } from './Order';
import type { User } from './User';

@Entity('guest_order_details')
export class GuestOrderDetail {
  @PrimaryColumn({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'varchar', length: 100 })
  guestName!: string;

  @Column({ type: 'varchar', length: 255 })
  guestPhoneHash!: string;

  @Column({ type: 'varchar', length: 4 })
  guestPhoneLast4!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guestEmail!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  orderPasswordHash!: string | null;

  @Column({ type: 'uuid', nullable: true })
  claimedUserId!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @OneToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @OneToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'claimedUserId' })
  claimedUser!: User | null;
}
