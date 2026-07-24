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

export interface User {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: User;
}
