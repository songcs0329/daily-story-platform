export interface Post {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  genre: string;
  viewCount: number;
  publishedAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
