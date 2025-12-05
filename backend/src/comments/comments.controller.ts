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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '创建评论' })
  @ApiResponse({ status: 201, description: '评论创建成功', type: Comment })
  create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  @ApiQuery({ name: 'product_id', required: false, description: '商品ID筛选' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Comment] })
  findAll(@Query('product_id') productId?: string): Promise<Comment[]> {
    const productIdNum = productId ? parseInt(productId, 10) : undefined;
    return this.commentsService.findAll(productIdNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取评论详情' })
  @ApiParam({ name: 'id', type: 'number', description: '评论ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Comment })
  @ApiResponse({ status: 404, description: '评论不存在' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新评论' })
  @ApiParam({ name: 'id', type: 'number', description: '评论ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Comment })
  @ApiResponse({ status: 404, description: '评论不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除评论' })
  @ApiParam({ name: 'id', type: 'number', description: '评论ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '评论不存在' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commentsService.remove(id);
  }
}

