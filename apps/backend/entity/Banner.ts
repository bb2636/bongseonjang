import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, RelationId } from 'typeorm';
import { BannerPosition } from './BannerPosition';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => BannerPosition)
  @JoinColumn({ name: 'banner_position_id' })
  position!: BannerPosition;

  @RelationId((banner: Banner) => banner.position)
  bannerPositionId!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 500, name: 'link_url', nullable: true })
  linkUrl!: string | null;

  @Column({ type: 'int', name: 'sort_no', default: 0 })
  sortNo!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', name: 'started_at', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'timestamp', name: 'ended_at', nullable: true })
  endedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}
