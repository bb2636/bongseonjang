import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Notice } from './Notice';

@Entity('notice_types')
export class NoticeType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'sortNo', type: 'int', default: 0 })
  sortNo!: number;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Notice, (notice) => notice.noticeType)
  notices!: Notice[];
}
