import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Product } from '../../products/entities/product.entity'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  order_number: string

  @ManyToOne(() => User, user => user.orders)
  user: User

  @Column()
  user_id: number

  @ManyToOne(() => Product, product => product.orders, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product

  @Column({ type: 'int', unsigned: true })
  product_id: number

  @Column()
  quantity: number

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number

  @Column({ default: 'pending' })
  status: string // pending, paid, shipped, completed, cancelled

  @Column({ nullable: true })
  shipping_address: string

  @Column({ nullable: true })
  payment_method: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @Column({ nullable: true })
  paid_at: Date

  @Column({ nullable: true })
  shipped_at: Date

  @Column({ nullable: true })
  completed_at: Date

  @Column({ nullable: true })
  cancelled_at: Date
}