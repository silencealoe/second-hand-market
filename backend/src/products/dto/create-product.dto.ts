import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ description: '卖家用户ID', example: 1 })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: '商品标题', example: '二手iPhone 13' })
  @IsNotEmpty({ message: '商品标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '商品描述', example: '9成新，功能完好', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '价格', example: 3999.99 })
  @IsNotEmpty({ message: '价格不能为空' })
  @IsNumber()
  @Min(0, { message: '价格必须大于等于0' })
  price: number;

  @ApiProperty({ description: '原价', example: 5999.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '原价必须大于等于0' })
  original_price?: number;

  @ApiProperty({
    description: '状态',
    enum: ProductStatus,
    example: ProductStatus.ON_SALE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: '分类', example: '电子产品', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '图片URL数组',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: '所在地', example: '北京市朝阳区', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '库存', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '库存数量必须大于等于1' })
  stock?: number;
}

