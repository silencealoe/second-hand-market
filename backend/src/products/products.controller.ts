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
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @Query('status') status?: ProductStatus,
    @Query('category') category?: string,
    @Query('user_id') userId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const userIdNum = userId ? parseInt(userId, 10) : undefined;
    const pageNum = page || 1;
    const limitNum = limit || 10;
    return this.productsService.findAll(status, category, userIdNum, pageNum, limitNum);
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

