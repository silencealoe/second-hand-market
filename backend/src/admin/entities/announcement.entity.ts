import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUser } from './admin-user.entity';

/**
 * 公告实体类
 * 用于存储商城公告信息
 */
@Entity('announcements')
export class Announcement {
  /**
   * 公告ID，主键自增
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '公告ID', example: 1 })
  id: number;

  /**
   * 公告标题
   */
  @Column({ length: 200 })
  @ApiProperty({ description: '公告标题', example: '系统维护通知' })
  title: string;

  /**
   * 公告内容
   */
  @Column({ type: 'text' })
  @ApiProperty({ description: '公告内容', example: '系统将于今晚进行维护...' })
  content: string;

  /**
   * 展示位置：home首页 / product商品页
   */
  @Column({ length: 20, default: 'home' })
  @ApiProperty({ description: '展示位置：home/product', example: 'home' })
  position: string;

  /**
   * 是否置顶：1置顶 0不置顶
   */
  @Column({ type: 'tinyint', default: 0 })
  @ApiProperty({ description: '是否置顶：1置顶 0不置顶', example: 0 })
  isTop: number;

  /**
   * 生效时间
   */
  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: '生效时间', example: '2024-01-01 10:00:00', required: false })
  startTime: Date;

  /**
   * 结束时间
   */
  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: '结束时间', example: '2024-12-31 23:59:59', required: false })
  endTime: Date;

  /**
   * 公告状态：1启用 0禁用
   */
  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: '状态：1启用 0禁用', example: 1 })
  status: number;

  /**
   * 创建人ID
   */
  @Column()
  @ApiProperty({ description: '创建人ID', example: 1 })
  createdBy: number;

  /**
   * 创建时间
   */
  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2024-01-01 10:00:00' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间', example: '2024-01-01 10:00:00' })
  updatedAt: Date;

  /**
   * 关联的创建人
   */
  @ManyToOne(() => AdminUser, (user) => user.id)
  @JoinColumn({ name: 'created_by' })
  creator: AdminUser;
}