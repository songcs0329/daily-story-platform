import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { getTodayGenre } from 'shared';
import useGetPosts from '@/hooks/useGetPosts';
import { GENRE_THEME } from '@/libs/utils/genreTheme';

function Posts() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetPosts();
  const posts = data?.pages.flatMap((page) => page.data);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const featured = getTodayGenre();
  const featuredTheme = GENRE_THEME[featured];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">
          이야기를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm leading-6 text-zinc-500">
          아직 등록된 이야기가 없습니다.
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.id}`}
            className={`group grid overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md ${GENRE_THEME[post.genre].cardHover}`}
          >
            <div className="aspect-video w-full overflow-hidden bg-zinc-100">
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="grid gap-2 p-5">
              <span
                className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${GENRE_THEME[post.genre].badge}`}
              >
                {GENRE_THEME[post.genre].label}
              </span>
              <h2 className="line-clamp-2 text-lg font-bold tracking-normal text-zinc-950">{post.title}</h2>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{new Date(post.publishedAt).toLocaleDateString('ko-KR')}</span>
                <span>조회 {post.viewCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-zinc-900 sm:px-8 sm:py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className={`text-sm font-semibold ${featuredTheme.accent}`}>
            매일 한 편 · 이번 시즌은 {featuredTheme.label}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-normal text-zinc-950 sm:text-3xl">
            하루 한 편, 오늘의 이야기
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            {featured === 'horror'
              ? '여름밤, 매일 새로 쓰인 공포 단편으로 서늘하게.'
              : '매일 새로 쓰인 로맨스 단편으로 설레는 하루를.'}
          </p>
        </section>

        {renderContent()}

        <div ref={sentinelRef} />

        {isFetchingNextPage && <div className="h-24 animate-pulse rounded-lg bg-zinc-100" />}
      </div>
    </main>
  );
}

export default Posts;
