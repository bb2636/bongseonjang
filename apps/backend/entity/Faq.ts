import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FaqCategory } from './FaqCategory';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint', name: 'category_id' })
  categoryId!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: true, name: 'is_visible' })
  isVisible!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => FaqCategory, (category) => category.faqs)
  @JoinColumn({ name: 'category_id' })
  category!: FaqCategory;
}
