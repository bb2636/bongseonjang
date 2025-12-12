import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { User } from './User';
import type { OrderItem } from './OrderItem';
import type { ShippingAddress } from './ShippingAddress';

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'refund_requested' | 'refunded';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  orderNumber!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  shippingAddressId!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: OrderStatus;

  @Column({ type: 'int' })
  totalProductPrice!: number;

  @Column({ type: 'int', default: 0 })
  totalDiscountAmount!: number;

  @Column({ type: 'int', default: 0 })
  usedPoints!: number;

  @Column({ type: 'int', default: 0 })
  couponDiscountAmount!: number;

  @Column({ type: 'int' })
  finalAmount!: number;

  @Column({ type: 'int', default: 0 })
  earnedPoints!: number;

  @Column({ type: 'text', nullable: true })
  orderNote!: string | null;

  @Column({ type: 'varchar', length: 100 })
  recipientName!: string;

  @Column({ type: 'varchar', length: 20 })
  recipientPhone!: string;

  @Column({ type: 'varchar', length: 10 })
  postalCode!: string;

  @Column({ type: 'varchar', length: 200 })
  address!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addressDetail!: string | null;

  @Column({ type: 'text', nullable: true })
  deliveryRequest!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt!: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  cartItemIdsSnapshot!: string[] | null;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne('ShippingAddress', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shippingAddressId' })
  shippingAddress!: ShippingAddress | null;

  @OneToMany('OrderItem', 'order')
  items!: OrderItem[];
}
