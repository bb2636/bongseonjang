import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import type { User } from './User';
import type { WishlistItem } from './WishlistItem';

@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany('WishlistItem', 'wishlist')
  items!: WishlistItem[];
}
