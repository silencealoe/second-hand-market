import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartsRepository: Repository<Cart>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  // 添加商品到购物车
  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const { user_id, product_id, quantity = 1 } = createCartDto;

    // 检查商品是否存在
    const product = await this.productsRepository.findOne({ where: { id: product_id } });
    if (!product) {
      throw new NotFoundException(`商品ID为 ${product_id} 的商品不存在`);
    }

    // 检查商品是否在售且有库存
    if (product.status !== 'on_sale' || product.stock < quantity) {
      throw new BadRequestException('商品库存不足或已下架');
    }

    // 检查购物车中是否已存在该商品
    let cartItem = await this.cartsRepository.findOne({
      where: { user_id, product_id },
    });

    if (cartItem) {
      // 如果已存在，增加数量
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException('商品库存不足');
      }
      cartItem.quantity = newQuantity;
      return await this.cartsRepository.save(cartItem);
    } else {
      // 如果不存在，创建新的购物车记录
      cartItem = this.cartsRepository.create(createCartDto);
      return await this.cartsRepository.save(cartItem);
    }
  }

  // 获取用户购物车列表
  async findAllByUserId(user_id: number): Promise<Cart[]> {
    return await this.cartsRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product', 'product')
      .where('cart.user_id = :user_id', { user_id })
      .getMany();
  }

  // 更新购物车商品数量或选中状态
  async update(id: number, updateCartDto: UpdateCartDto, user_id: number): Promise<Cart> {
    // 检查购物车项是否存在且属于当前用户
    const cartItem = await this.cartsRepository.findOne({
      where: { id, user_id },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('购物车商品不存在');
    }

    // 如果更新数量，检查库存
    if (updateCartDto.quantity) {
      if (updateCartDto.quantity > cartItem.product.stock) {
        throw new BadRequestException('商品库存不足');
      }
    }

    // 更新购物车项
    Object.assign(cartItem, updateCartDto);
    return await this.cartsRepository.save(cartItem);
  }

  // 删除购物车商品
  async remove(id: number, user_id: number): Promise<void> {
    // 检查购物车项是否存在且属于当前用户
    const cartItem = await this.cartsRepository.findOne({
      where: { id, user_id },
    });

    if (!cartItem) {
      throw new NotFoundException('购物车商品不存在');
    }

    await this.cartsRepository.remove(cartItem);
  }

  // 清空购物车
  async clear(user_id: number): Promise<void> {
    await this.cartsRepository.delete({ user_id });
  }

  // 更新多个购物车商品的选中状态
  async updateMultipleSelected(ids: number[], selected: boolean, user_id: number): Promise<void> {
    await this.cartsRepository
      .createQueryBuilder()
      .update(Cart)
      .set({ selected })
      .where('id IN (:...ids) AND user_id = :user_id', { ids, user_id })
      .execute();
  }

  // 批量删除购物车商品
  async removeMultiple(ids: number[], user_id: number): Promise<void> {
    await this.cartsRepository
      .createQueryBuilder()
      .delete()
      .from(Cart)
      .where('id IN (:...ids) AND user_id = :user_id', { ids, user_id })
      .execute();
  }
}