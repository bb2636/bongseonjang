import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NoticeType } from './NoticeType';

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint', name: 'type_id' })
  typeId!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: true, name: 'is_visible' })
  isVisible!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => NoticeType, (noticeType) => noticeType.notices)
  @JoinColumn({ name: 'type_id' })
  noticeType!: NoticeType;
}
