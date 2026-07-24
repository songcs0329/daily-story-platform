import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CommentsEntity } from './entities/comments.entity';
import type { Comment } from 'shared';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentRepository: Repository<CommentsEntity>,
    private readonly usersService: UsersService,
  ) {}

  // ponytail: no pagination, add when a single post's comment count gets large enough to matter
  async getComments(postId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });

    const users = await this.usersService.findByIds([...new Set(comments.map((c) => c.userId))]);
    const userById = new Map(users.map((user) => [user.id, user]));

    return comments.map((comment) => {
      const author = userById.get(comment.userId);
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: author
          ? { id: author.id, nickname: author.nickname, profileImageUrl: author.profileImageUrl }
          : { id: comment.userId, nickname: '알 수 없음', profileImageUrl: null },
      };
    });
  }

  async createComment(postId: number, userId: number, content: string): Promise<Comment> {
    const entity = await this.commentRepository.save(this.commentRepository.create({ postId, userId, content }));
    const [author] = await this.usersService.findByIds([userId]);
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      author: { id: author.id, nickname: author.nickname, profileImageUrl: author.profileImageUrl },
    };
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException(`Comment ${commentId} not found`);
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인 댓글만 삭제할 수 있습니다.');
    }
    await this.commentRepository.remove(comment);
  }
}
