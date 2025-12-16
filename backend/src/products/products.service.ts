import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(
    status?: ProductStatus,
    category?: string,
    userId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .select([
        'product.id',
        'product.user_id',
        'product.title',
        'product.description',
        'product.price',
        'product.original_price',
        'product.status',
        'product.category',
        'product.images',
        'product.location',
        'product.view_count',
        'product.stock',
        'product.created_at',
        'product.updated_at',
        'user.id',
        'user.username',
        'user.avatar',
      ]);

    if (status) {
      queryBuilder.where('product.status = :status', { status });
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (userId) {
      queryBuilder.andWhere('product.user_id = :userId', { userId });
    }

    queryBuilder.orderBy('product.created_at', 'DESC');

    // 获取总数
    const total = await queryBuilder.getCount();

    // 分页查询
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException(`ID为 ${id} 的商品不存在`);
    }

    // 增加浏览次数
    product.view_count += 1;
    await this.productsRepository.save(product);

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}

