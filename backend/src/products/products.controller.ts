import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStatus } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功', type: Product })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'status', enum: ProductStatus, required: false, description: '商品状态筛选' })
  @ApiQuery({ name: 'category', required: false, description: '分类筛选' })
  @ApiQuery({ name: 'user_id', required: false, description: '用户ID筛选' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: '页码，从1开始', example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'title', required: false, description: '商品标题搜索（模糊匹配）' })
  @ApiQuery({ name: 'min_price', type: Number, required: false, description: '最低价格' })
  @ApiQuery({ name: 'max_price', type: Number, required: false, description: '最高价格' })
  @ApiQuery({ name: 'location', required: false, description: '所在地筛选（模糊匹配）' })
  @ApiQuery({ name: 'sort_by', required: false, description: '排序字段：price, created_at, view_count', example: 'created_at' })
  @ApiQuery({ name: 'sort_order', required: false, description: '排序方式：ASC, DESC', example: 'DESC' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @Query('status') status?: ProductStatus,
    @Query('category') category?: string,
    @Query('user_id') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('title') title?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string,
    @Query('location') location?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: 'ASC' | 'DESC',
  ) {
    const userIdNum = userId ? parseInt(userId, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const minPriceNum = minPrice && minPrice.trim() !== '' ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice && maxPrice.trim() !== '' ? parseFloat(maxPrice) : undefined;
    
    return this.productsService.findAll(
      status,
      category,
      userIdNum,
      pageNum,
      limitNum,
      title,
      minPriceNum,
      maxPriceNum,
      location,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取商品详情' })
  @ApiParam({ name: 'id', type: 'number', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Product })
  @ApiResponse({ status: 404, description: '商品不存在' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'id', type: 'number', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Product })
  @ApiResponse({ status: 404, description: '商品不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', type: 'number', description: '商品ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}

