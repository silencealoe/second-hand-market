import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Min } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiProperty({ description: '商品标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '商品描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '价格', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '价格必须大于等于0' })
  price?: number;

  @ApiProperty({ description: '原价', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '原价必须大于等于0' })
  original_price?: number;

  @ApiProperty({ description: '状态', enum: ProductStatus, required: false })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: '分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '图片URL数组', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: '所在地', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

