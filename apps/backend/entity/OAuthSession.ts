import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('oauth_sessions')
export class OAuthSession {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar', { length: 20 })
  type!: string;

  @Column('varchar', { length: 20, default: 'pending' })
  status!: string;

  @Column('jsonb', { nullable: true })
  data!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamp')
  expiresAt!: Date;
}
