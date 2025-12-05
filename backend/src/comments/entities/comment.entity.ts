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
import { Product } from '../../products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('comments')
export class Comment {
  @ApiProperty({ description: '评论ID' })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ description: '商品ID' })
  @Column({ type: 'int', unsigned: true })
  product_id: number;

  @ApiProperty({ description: '评论用户ID' })
  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @ApiProperty({ description: '父评论ID（用于回复）', required: false })
  @Column({ type: 'int', unsigned: true, nullable: true })
  parent_id: number;

  @ApiProperty({ description: '评论内容' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Product, (product) => product.comments)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];
}

