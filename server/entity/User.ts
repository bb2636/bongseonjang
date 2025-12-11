import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { Review } from './Review';
import type { UserSocialAccount } from './UserSocialAccount';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string | null;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', nullable: true })
  referralId!: string | null;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany('Review', 'user')
  reviews!: Review[];

  @OneToMany('UserSocialAccount', 'user')
  socialAccounts!: UserSocialAccount[];
}
