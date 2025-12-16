import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('email_verification_tokens')
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
