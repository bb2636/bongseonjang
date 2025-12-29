import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InvestmentInfoType } from './InvestmentInfoType';

@Entity('investment_infos')
export class InvestmentInfo {
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

  @ManyToOne(() => InvestmentInfoType, (investmentInfoType) => investmentInfoType.investmentInfos)
  @JoinColumn({ name: 'type_id' })
  investmentInfoType!: InvestmentInfoType;
}
