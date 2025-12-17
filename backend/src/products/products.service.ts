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
    title?: string,
    minPrice?: number,
    maxPrice?: number,
    location?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
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
        'product.created_at',
        'product.updated_at',
        'user.id',
        'user.username',
        'user.avatar',
      ]);

    // 状态筛选
    if (status) {
      queryBuilder.where('product.status = :status', { status });
    }

    // 分类筛选
    if (category) {
      if (status) {
        queryBuilder.andWhere('product.category = :category', { category });
      } else {
        queryBuilder.where('product.category = :category', { category });
      }
    }

    // 用户ID筛选
    if (userId) {
      const whereCondition = status || category ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.user_id = :userId', { userId });
    }

    // 标题搜索（模糊匹配）
    if (title) {
      const whereCondition = status || category || userId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.title LIKE :title', { title: `%${title}%` });
    }

    // 价格范围筛选
    if (minPrice !== undefined) {
      const whereCondition = status || category || userId || title ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      const whereCondition = status || category || userId || title || minPrice !== undefined ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.price <= :maxPrice', { maxPrice });
    }

    // 所在地筛选
    if (location) {
      const whereCondition = status || category || userId || title || minPrice !== undefined || maxPrice !== undefined ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.location LIKE :location', { location: `%${location}%` });
    }

    // 排序
    const sortField = sortBy || 'created_at';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`product.${sortField}`, order);

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

