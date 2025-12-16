import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Shipment } from './Shipment';

@Entity('shipment_events')
export class ShipmentEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  shipmentId!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamp' })
  eventTime!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('Shipment', 'events', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment!: Shipment;
}
