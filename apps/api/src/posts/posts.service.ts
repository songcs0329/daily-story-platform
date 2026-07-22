import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postRepository: Repository<PostsEntity>,
  ) {}

  findAll(): Promise<PostsEntity[]> {
    return this.postRepository.find({ order: { publishedAt: 'DESC' } });
  }

  async findOne(id: number): Promise<PostsEntity> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    await this.postRepository.increment({ id }, 'viewCount', 1);
    post.viewCount += 1;
    return post;
  }
}
