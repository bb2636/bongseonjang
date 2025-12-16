import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import type { User } from './User';
import type { CartItem } from './CartItem';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guestToken!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne('User', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @OneToMany('CartItem', 'cart')
  items!: CartItem[];
}
