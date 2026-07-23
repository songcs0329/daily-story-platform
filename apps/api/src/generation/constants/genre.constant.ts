import type { Genre } from 'shared';
import { GENRE_LABELS, getTodayGenre } from 'shared';

export { GENRE_LABELS, getTodayGenre };

export const GENRE_STORY_PROMPTS: Record<Genre, string> = {
  horror: '한국어로 짧은 공포 단편소설을 써줘. 소름 끼치고 긴장감 있는 분위기로, 1200~2000자 분량. 제목도 함께 지어줘.',
  romance: '한국어로 짧은 로맨스 단편소설을 써줘. 따뜻하고 설레는 분위기로, 1200~2000자 분량. 제목도 함께 지어줘.',
};
