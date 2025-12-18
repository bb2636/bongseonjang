import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { SupportTicket } from './SupportTicket';
import type { User } from './User';

export type MessageSender = 'customer' | 'admin';

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ticketId!: string;

  @Column({ type: 'uuid', nullable: true })
  senderId!: string | null;

  @Column({ type: 'varchar', length: 10 })
  senderType!: MessageSender;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-array', nullable: true })
  attachmentUrls!: string[] | null;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne('SupportTicket', 'messages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket!: SupportTicket;

  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender!: User | null;
}
