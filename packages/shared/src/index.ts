export const GENRES = ['horror', 'romance'] as const;
export type Genre = (typeof GENRES)[number];

export interface Post {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  genre: Genre;
  viewCount: number;
  publishedAt: string;
}
