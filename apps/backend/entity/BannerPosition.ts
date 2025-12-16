import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('banner_positions')
export class BannerPosition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'int', name: 'sort_no', default: 0 })
  sortNo!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;
}
