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
  UseInterceptors,
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
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { CustomValidationPipe } from '../common/pipes/custom-validation.pipe';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('products')
@Controller('products')
@UseInterceptors(LoggingInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功', type: Product })
  async create(@Body(CustomValidationPipe) createProductDto: CreateProductDto) {
    const result = await this.productsService.create(createProductDto);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
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
  @Public()
  async findAll(
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
    
    const result = await this.productsService.findAll(
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
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取商品详情' })
  @ApiParam({ name: 'id', type: 'number', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Product })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.productsService.findOne(id);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'id', type: 'number', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Product })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const result = await this.productsService.update(id, updateProductDto);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', type: 'number', description: '商品ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }
}

