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
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: '添加商品到购物车' })
  @ApiResponse({ status: 201, description: '添加成功', type: Cart })
  @ApiResponse({ status: 400, description: '请求参数错误或库存不足' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async create(@Body() createCartDto: CreateCartDto) {
    const result = await this.cartsService.create(createCartDto);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get()
  @ApiOperation({ summary: '获取用户购物车列表' })
  @ApiQuery({ name: 'user_id', required: true, description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '获取成功', type: [Cart] })
  async findAllByUserId(@Query('user_id', ParseIntPipe) user_id: number) {
    const result = await this.cartsService.findAllByUserId(user_id);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新购物车商品数量或选中状态' })
  @ApiParam({ name: 'id', type: 'number', description: '购物车商品ID' })
  @ApiQuery({ name: 'user_id', required: true, description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '更新成功', type: Cart })
  @ApiResponse({ status: 400, description: '请求参数错误或库存不足' })
  @ApiResponse({ status: 404, description: '购物车商品不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartDto: UpdateCartDto,
    @Query('user_id', ParseIntPipe) user_id: number,
  ) {
    const result = await this.cartsService.update(id, updateCartDto, user_id);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除购物车商品' })
  @ApiParam({ name: 'id', type: 'number', description: '购物车商品ID' })
  @ApiQuery({ name: 'user_id', required: true, description: '用户ID', example: 1 })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '购物车商品不存在' })
  async remove(@Param('id', ParseIntPipe) id: number, @Query('user_id', ParseIntPipe) user_id: number) {
    await this.cartsService.remove(id, user_id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '清空购物车' })
  @ApiQuery({ name: 'user_id', required: true, description: '用户ID', example: 1 })
  @ApiResponse({ status: 204, description: '清空成功' })
  async clear(@Query('user_id', ParseIntPipe) user_id: number) {
    await this.cartsService.clear(user_id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }

  @Patch('selected')
  @ApiOperation({ summary: '更新多个商品的选中状态' })
  @ApiQuery({ name: 'user_id', required: true, description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateMultipleSelected(
    @Body('ids') ids: number[],
    @Body('selected') selected: boolean,
    @Query('user_id', ParseIntPipe) user_id: number,
  ) {
    await this.cartsService.updateMultipleSelected(ids, selected, user_id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }

  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '批量删除购物车商品' })
  @ApiQuery({ name: 'user_id', required: true, description: '用户ID', example: 1 })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async removeMultiple(
    @Body('ids') ids: number[],
    @Query('user_id', ParseIntPipe) user_id: number,
  ) {
    await this.cartsService.removeMultiple(ids, user_id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }
}