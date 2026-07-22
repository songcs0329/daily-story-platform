import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GENRES } from 'shared';
import type { Genre, Post } from 'shared';

@Entity('posts')
export class PostEntity implements Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ name: 'thumbnail_url' })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: GENRES })
  genre: Genre;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'published_at', type: 'timestamptz' })
  publishedAt: string;
}
