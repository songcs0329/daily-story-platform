import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './entities/posts.entity';
import type { Paginated } from 'shared';

const MAX_LIMIT = 50;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postRepository: Repository<PostsEntity>,
  ) {}

  async getPosts(page: number, limit: number): Promise<Paginated<PostsEntity>> {
    const take = Math.min(limit, MAX_LIMIT);
    const [data, total] = await this.postRepository.findAndCount({
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * take,
      take,
    });
    return { data, total, page, limit: take };
  }

  async getPost(id: number): Promise<PostsEntity> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    await this.postRepository.increment({ id }, 'viewCount', 1);
    post.viewCount += 1;
    return post;
  }
}
