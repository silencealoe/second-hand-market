import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('carts')
export class Cart {
  @ApiProperty({ description: '购物车ID' })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @ApiProperty({ description: '商品ID' })
  @Column({ type: 'int', unsigned: true })
  product_id: number;

  @ApiProperty({ description: '数量' })
  @Column({ type: 'int', unsigned: true, default: 1 })
  quantity: number;

  @ApiProperty({ description: '是否选中' })
  @Column({ type: 'boolean', default: true })
  selected: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.carts)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
