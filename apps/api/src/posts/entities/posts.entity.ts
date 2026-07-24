import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Post } from 'shared';

@Entity('posts')
export class PostsEntity implements Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ name: 'thumbnail_url' })
  thumbnailUrl: string;

  @Column({ type: 'text' })
  genre: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'published_at', type: 'timestamptz' })
  publishedAt: string;
}
