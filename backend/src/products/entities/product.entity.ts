import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  ON_SALE = 'on_sale',
  SOLD = 'sold',
  OFF_SHELF = 'off_shelf',
}

@Entity('products')
export class Product {
  @ApiProperty({ description: '商品ID' })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ description: '卖家用户ID' })
  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @ApiProperty({ description: '商品标题' })
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiProperty({ description: '商品描述', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '价格' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: '原价', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  original_price: number;

  @ApiProperty({ description: '状态：on_sale-在售, sold-已售, off_shelf-下架', enum: ProductStatus })
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ON_SALE,
  })
  status: ProductStatus;

  @ApiProperty({ description: '分类', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @ApiProperty({ description: '图片URL数组', type: [String], required: false })
  @Column({ type: 'json', nullable: true })
  images: string[];

  @ApiProperty({ description: '所在地', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @ApiProperty({ description: '浏览次数' })
  @Column({ type: 'int', unsigned: true, default: 0 })
  view_count: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.product)
  comments: Comment[];
}

