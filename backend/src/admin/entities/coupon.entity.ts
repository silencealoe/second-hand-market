import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 优惠券实体类
 * 用于存储商城优惠券信息
 */
@Entity('coupons')
export class Coupon {
  /**
   * 优惠券ID，主键自增
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '优惠券ID', example: 1 })
  id: number;

  /**
   * 优惠券名称
   */
  @Column({ length: 100 })
  @ApiProperty({ description: '优惠券名称', example: '新用户专享优惠券' })
  name: string;

  /**
   * 优惠券类型：discount折扣券 / amount满减券 / free无门槛券
   */
  @Column({ length: 20, default: 'discount' })
  @ApiProperty({ description: '类型：discount/amount/free', example: 'discount' })
  type: string;

  /**
   * 优惠券面值或折扣率
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: '面值/折扣', example: 10.5 })
  value: number;

  /**
   * 最低消费金额，0表示无门槛
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ description: '最低消费金额', example: 100 })
  minAmount: number;

  /**
   * 总发放数量，0表示不限量
   */
  @Column({ default: 0 })
  @ApiProperty({ description: '总发放数量', example: 1000 })
  totalQuantity: number;

  /**
   * 已使用数量
   */
  @Column({ default: 0 })
  @ApiProperty({ description: '已使用数量', example: 50 })
  usedQuantity: number;

  /**
   * 适用分类ID列表，JSON格式存储
   */
  @Column({ type: 'json', nullable: true })
  @ApiProperty({ 
    description: '适用分类ID列表', 
    example: [1, 2, 3],
    required: false 
  })
  categoryIds: number[];

  /**
   * 生效时间
   */
  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: '生效时间', example: '2024-01-01 00:00:00', required: false })
  startTime: Date;

  /**
   * 失效时间
   */
  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ description: '失效时间', example: '2024-12-31 23:59:59', required: false })
  endTime: Date;

  /**
   * 优惠券状态：1启用 0禁用
   */
  @Column({ type: 'tinyint', default: 1 })
  @ApiProperty({ description: '状态：1启用 0禁用', example: 1 })
  status: number;

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
}