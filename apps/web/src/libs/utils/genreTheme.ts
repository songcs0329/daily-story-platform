export interface GenreTheme {
  label: string;
  tagline: string;
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

const GENRE_THEME: Record<string, GenreTheme> = {
  horror: {
    label: '공포',
    tagline: '여름밤, 매일 새로 쓰인 공포 단편으로 서늘하게.',
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
    label: '로맨스',
    tagline: '매일 새로 쓰인 로맨스 단편으로 설레는 하루를.',
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
  thriller: {
    label: '스릴러',
    tagline: '숨 막히는 스릴러 단편으로 오늘 하루의 긴장을.',
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    accent: 'text-sky-400',
    cardHover: 'hover:border-sky-400',
    pageBg: 'bg-slate-950 text-slate-100',
    surface: 'border-slate-800 bg-slate-900',
    heading: 'text-slate-50',
    muted: 'text-slate-400',
    body: 'text-slate-300',
    placeholder: 'bg-slate-800',
  },
  fantasy: {
    label: '판타지',
    tagline: '매일 펼쳐지는 판타지 단편으로 상상의 문을 열어보세요.',
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
    accent: 'text-violet-600',
    cardHover: 'hover:border-violet-300',
    pageBg: 'bg-violet-50 text-zinc-900',
    surface: 'border-violet-200 bg-white',
    heading: 'text-zinc-950',
    muted: 'text-zinc-500',
    body: 'text-zinc-800',
    placeholder: 'bg-violet-100',
  },
  sf: {
    label: 'SF',
    tagline: '미래를 그리는 SF 단편으로 하루를 채워보세요.',
    badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100',
    accent: 'text-cyan-400',
    cardHover: 'hover:border-cyan-400',
    pageBg: 'bg-zinc-900 text-zinc-100',
    surface: 'border-cyan-900 bg-zinc-950',
    heading: 'text-cyan-50',
    muted: 'text-cyan-300',
    body: 'text-zinc-300',
    placeholder: 'bg-zinc-800',
  },
  comedy: {
    label: '코미디',
    tagline: '웃음이 필요한 하루, 매일 새로운 코미디 단편으로.',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    accent: 'text-amber-600',
    cardHover: 'hover:border-amber-300',
    pageBg: 'bg-amber-50 text-zinc-900',
    surface: 'border-amber-200 bg-white',
    heading: 'text-zinc-950',
    muted: 'text-zinc-500',
    body: 'text-zinc-800',
    placeholder: 'bg-amber-100',
  },
};

// ponytail: DB(genres 테이블)에 새 장르가 추가돼도 프론트 배포 전까지는 이 기본 테마로 렌더링
const DEFAULT_THEME: GenreTheme = {
  label: '단편',
  tagline: '매일 새로 쓰인 단편소설로 하루를 채워보세요.',
  badge: 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200',
  accent: 'text-zinc-600',
  cardHover: 'hover:border-zinc-300',
  pageBg: 'bg-stone-50 text-zinc-900',
  surface: 'border-zinc-200 bg-white',
  heading: 'text-zinc-950',
  muted: 'text-zinc-500',
  body: 'text-zinc-800',
  placeholder: 'bg-zinc-100',
};

export function getGenreTheme(genre?: string): GenreTheme {
  return (genre && GENRE_THEME[genre]) || DEFAULT_THEME;
}
