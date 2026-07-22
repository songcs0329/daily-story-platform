export type Genre = 'horror' | 'romance';

export interface Post {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  genre: Genre;
  viewCount: number;
  publishedAt: string;
}
