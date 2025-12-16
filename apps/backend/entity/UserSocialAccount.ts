import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from './User';

export type SocialProvider = 'kakao' | 'naver';

@Entity('user_social_accounts')
@Unique(['provider', 'providerUserId'])
@Index(['userId'])
export class UserSocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  provider!: SocialProvider;

  @Column({ type: 'varchar' })
  providerUserId!: string;

  @Column({ type: 'varchar', nullable: true })
  emailFromProvider!: string | null;

  @Column({ type: 'varchar', nullable: true })
  displayName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  profileImage!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  linkedAt!: Date;

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
