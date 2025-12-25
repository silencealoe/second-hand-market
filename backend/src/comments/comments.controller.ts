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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('comments')
@Controller('comments')
@UseInterceptors(LoggingInterceptor)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '创建评论' })
  @ApiResponse({ status: 201, description: '评论创建成功', type: Comment })
  async create(@Body() createCommentDto: CreateCommentDto) {
    const result = await this.commentsService.create(createCommentDto);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  @ApiQuery({ name: 'product_id', required: false, description: '商品ID筛选' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Comment] })
  @Public()
  async findAll(@Query('product_id') productId?: string) {
    const productIdNum = productId ? parseInt(productId, 10) : undefined;
    const result = await this.commentsService.findAll(productIdNum);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取评论详情' })
  @ApiParam({ name: 'id', type: 'number', description: '评论ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Comment })
  @ApiResponse({ status: 404, description: '评论不存在' })
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.commentsService.findOne(id);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新评论' })
  @ApiParam({ name: 'id', type: 'number', description: '评论ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Comment })
  @ApiResponse({ status: 404, description: '评论不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const result = await this.commentsService.update(id, updateCommentDto);
    
    return {
      code: 200,
      message: 'success',
      data: result
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除评论' })
  @ApiParam({ name: 'id', type: 'number', description: '评论ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '评论不存在' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commentsService.remove(id);
    
    return {
      code: 200,
      message: 'success',
      data: null
    };
  }
}

