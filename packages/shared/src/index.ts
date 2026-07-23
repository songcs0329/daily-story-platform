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

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function getTodayGenre(date = new Date()): Genre {
  const month = date.getMonth() + 1;
  return month >= 6 && month <= 9 ? 'horror' : 'romance';
}

export const GENRE_LABELS: Record<Genre, string> = {
  horror: '공포',
  romance: '로맨스',
};
