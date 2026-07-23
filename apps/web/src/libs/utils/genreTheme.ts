import { GENRE_LABELS, type Genre } from 'shared';

interface GenreTheme {
  label: string;
  badge: string;
  accent: string;
  cardHover: string;
  pageBg: string;
  surface: string;
  heading: string;
  muted: string;
  body: string;
  placeholder: string;
}

export const GENRE_THEME: Record<Genre, GenreTheme> = {
  horror: {
    label: GENRE_LABELS.horror,
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    accent: 'text-red-400',
    cardHover: 'hover:border-red-300',
    pageBg: 'bg-zinc-950 text-zinc-100',
    surface: 'border-zinc-800 bg-zinc-900',
    heading: 'text-zinc-50',
    muted: 'text-zinc-400',
    body: 'text-zinc-300',
    placeholder: 'bg-zinc-800',
  },
  romance: {
    label: GENRE_LABELS.romance,
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    accent: 'text-rose-600',
    cardHover: 'hover:border-rose-300',
    pageBg: 'bg-stone-50 text-zinc-900',
    surface: 'border-zinc-200 bg-white',
    heading: 'text-zinc-950',
    muted: 'text-zinc-500',
    body: 'text-zinc-800',
    placeholder: 'bg-zinc-100',
  },
};
