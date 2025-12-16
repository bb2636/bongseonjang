import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Faq } from './Faq';

@Entity('faq_categories')
export class FaqCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Faq, (faq) => faq.category)
  faqs!: Faq[];
}
