import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import type { User } from './User';
import type { PointTransaction } from './PointTransaction';

@Entity('point_wallets')
export class PointWallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @Column({ type: 'int', default: 0 })
  balance!: number;

  @Column({ type: 'int', default: 0 })
  totalEarned!: number;

  @Column({ type: 'int', default: 0 })
  totalUsed!: number;

  @Column({ type: 'int', default: 0 })
  totalExpired!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany('PointTransaction', 'wallet')
  transactions!: PointTransaction[];
}
