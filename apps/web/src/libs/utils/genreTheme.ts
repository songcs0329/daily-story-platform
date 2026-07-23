import { GENRE_LABELS, type Genre } from 'shared';

interface GenreTheme {
  label: string;
  badge: string;
  accent: string;
  cardHover: string;
}

export const GENRE_THEME: Record<Genre, GenreTheme> = {
  horror: {
    label: GENRE_LABELS.horror,
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    accent: 'text-red-700',
    cardHover: 'hover:border-red-300',
  },
  romance: {
    label: GENRE_LABELS.romance,
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    accent: 'text-rose-600',
    cardHover: 'hover:border-rose-300',
  },
};
