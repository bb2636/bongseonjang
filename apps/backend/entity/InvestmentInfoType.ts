import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { InvestmentInfo } from './InvestmentInfo';

@Entity('investment_info_types')
export class InvestmentInfoType {
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

  @OneToMany(() => InvestmentInfo, (investmentInfo) => investmentInfo.investmentInfoType)
  investmentInfos!: InvestmentInfo[];
}
