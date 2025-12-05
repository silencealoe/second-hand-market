import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create(createCommentDto);
    return await this.commentsRepository.save(comment);
  }

  async findAll(productId?: number): Promise<Comment[]> {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .select([
        'comment.id',
        'comment.product_id',
        'comment.user_id',
        'comment.parent_id',
        'comment.content',
        'comment.created_at',
        'comment.updated_at',
        'user.id',
        'user.username',
        'user.avatar',
        'replies.id',
        'replies.content',
        'replies.created_at',
        'replyUser.id',
        'replyUser.username',
        'replyUser.avatar',
      ])
      .where('comment.parent_id IS NULL'); // 只获取顶级评论

    if (productId) {
      queryBuilder.andWhere('comment.product_id = :productId', { productId });
    }

    queryBuilder.orderBy('comment.created_at', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'product', 'parent', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException(`ID为 ${id} 的评论不存在`);
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentDto);
    return await this.commentsRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepository.remove(comment);
  }
}

