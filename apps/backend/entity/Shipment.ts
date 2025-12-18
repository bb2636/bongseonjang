import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { Order } from './Order';
import type { ShipmentEvent } from './ShipmentEvent';

export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier!: string | null;

  @Column({ type: 'varchar', length: 50 })
  carrierCode!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrierName!: string | null;

  @Column({ type: 'varchar', length: 100 })
  trackingNumber!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: ShipmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @OneToMany('ShipmentEvent', 'shipment')
  events!: ShipmentEvent[];
}
