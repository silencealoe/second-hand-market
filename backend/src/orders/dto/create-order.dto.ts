import { IsInt, IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateOrderDto {
  @ApiProperty({ description: '用户ID' })
  @IsInt()
  @Min(1)
  user_id: number

  @ApiProperty({ description: '商品ID' })
  @IsInt()
  @Min(1)
  product_id: number

  @ApiProperty({ description: '购买数量' })
  @IsInt()
  @Min(1)
  quantity: number

  @ApiProperty({ description: '收货地址', required: false })
  @IsString()
  @IsOptional()
  shipping_address?: string

  @ApiProperty({ description: '支付方式', required: false })
  @IsString()
  @IsOptional()
  payment_method?: string
}