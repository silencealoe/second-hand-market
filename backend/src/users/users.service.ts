import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search } = options || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.email', 'user.phone', 'user.avatar', 'user.address', 'user.created_at', 'user.updated_at']);

    // 关键词搜索（用户名或邮箱）
    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // 排序和分页
    queryBuilder
      .orderBy('user.id', 'DESC')
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'phone', 'avatar', 'address', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new NotFoundException(`ID为 ${id} 的用户不存在`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 如果更新邮箱，检查是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('邮箱已被其他用户使用');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    try {
      await this.usersRepository.remove(user);
    } catch (error) {
      // 检查是否是外键约束错误
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message.includes('foreign key constraint fails')) {
        throw new ConflictException(
          '无法删除该用户，因为该用户存在关联的商品、订单或其他数据。请先处理相关数据后再删除用户。'
        );
      }
      // 重新抛出其他错误
      throw error;
    }
  }

  /**
   * 检查用户是否可以被删除（没有关联数据）
   * @param id 用户ID
   * @returns 检查结果
   */
  async checkUserDeletable(id: number): Promise<{
    canDelete: boolean;
    relatedData: {
      products: number;
      comments: number;
      carts: number;
      orders: number;
    };
  }> {
    const user = await this.findOne(id);

    // 查询关联数据数量
    const [productsCount, commentsCount, cartsCount, ordersCount] = await Promise.all([
      this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user.products', 'product')
        .where('user.id = :id', { id })
        .select('COUNT(product.id)', 'count')
        .getRawOne()
        .then(result => parseInt(result.count) || 0),

      this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user.comments', 'comment')
        .where('user.id = :id', { id })
        .select('COUNT(comment.id)', 'count')
        .getRawOne()
        .then(result => parseInt(result.count) || 0),

      this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user.carts', 'cart')
        .where('user.id = :id', { id })
        .select('COUNT(cart.id)', 'count')
        .getRawOne()
        .then(result => parseInt(result.count) || 0),

      this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user.orders', 'order')
        .where('user.id = :id', { id })
        .select('COUNT(order.id)', 'count')
        .getRawOne()
        .then(result => parseInt(result.count) || 0),
    ]);

    const relatedData = {
      products: productsCount,
      comments: commentsCount,
      carts: cartsCount,
      orders: ordersCount,
    };

    const canDelete = Object.values(relatedData).every(count => count === 0);

    return {
      canDelete,
      relatedData,
    };
  }

  /**
   * 强制删除用户及其所有关联数据（谨慎使用）
   * @param id 用户ID
   * @param options 删除选项
   */
  async forceRemove(id: number, options?: {
    deleteProducts?: boolean;
    deleteComments?: boolean;
    deleteCarts?: boolean;
    deleteOrders?: boolean;
  }): Promise<void> {
    const user = await this.findOne(id);
    const { deleteProducts = false, deleteComments = false, deleteCarts = false, deleteOrders = false } = options || {};

    // 使用事务确保数据一致性
    await this.usersRepository.manager.transaction(async (transactionalEntityManager) => {
      // 删除关联数据
      if (deleteProducts) {
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from('products')
          .where('user_id = :userId', { userId: id })
          .execute();
      }

      if (deleteComments) {
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from('comments')
          .where('user_id = :userId', { userId: id })
          .execute();
      }

      if (deleteCarts) {
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from('carts')
          .where('user_id = :userId', { userId: id })
          .execute();
      }

      if (deleteOrders) {
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from('orders')
          .where('user_id = :userId', { userId: id })
          .execute();
      }

      // 最后删除用户
      await transactionalEntityManager.remove(user);
    });
  }
}

