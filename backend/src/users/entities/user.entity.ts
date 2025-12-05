import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ description: '用户名' })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ description: '手机号', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: '头像URL', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @ApiProperty({ description: '地址', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}

