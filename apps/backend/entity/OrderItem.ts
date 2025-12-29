import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Order } from './Order';
import type { Product } from './Product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'uuid', nullable: true })
  productId!: string | null;

  @Column({ type: 'varchar', length: 200 })
  productName!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  productImageUrl!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'option_name' })
  optionName!: string | null;

  @Column({ type: 'bigint', nullable: true })
  productOptionId!: number | null;

  @Column({ type: 'int' })
  unitPrice!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'int' })
  totalPrice!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('Order', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @ManyToOne('Product', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product!: Product | null;
}
