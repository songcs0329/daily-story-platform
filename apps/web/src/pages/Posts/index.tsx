import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useGetPosts from '@/hooks/useGetPosts';
import { getGenreTheme } from '@/libs/utils/genreTheme';
import useAuthStore from '@/stores/useAuthStore';

function Posts() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetPosts();
  const posts = data?.pages.flatMap((page) => page.data);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const featuredTheme = getGenreTheme(posts?.[0]?.genre);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

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
            <Skeleton key={index} className={`h-64 rounded-lg ${featuredTheme.placeholder}`} />
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
          <Link key={post.id} to={`/posts/${post.id}`} className="group block overflow-hidden rounded-lg">
            <Card
              className={`gap-0 overflow-hidden rounded-lg border p-0 shadow-sm transition hover:shadow-md ${featuredTheme.surface} ${getGenreTheme(post.genre).cardHover}`}
            >
              <div className={`aspect-video w-full overflow-hidden ${featuredTheme.placeholder}`}>
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="grid gap-2 p-5">
                <Badge className={getGenreTheme(post.genre).badge}>{getGenreTheme(post.genre).label}</Badge>
                <h2 className={`line-clamp-2 text-lg font-bold tracking-normal ${featuredTheme.heading}`}>
                  {post.title}
                </h2>
                <div className={`flex items-center justify-between text-xs ${featuredTheme.muted}`}>
                  <span>{new Date(post.publishedAt).toLocaleDateString('ko-KR')}</span>
                  <span>조회 {post.viewCount}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <main className={`min-h-screen px-4 py-6 sm:px-8 sm:py-8 ${featuredTheme.pageBg}`}>
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <Card className={`gap-0 rounded-lg border p-6 shadow-sm sm:p-8 ${featuredTheme.surface}`}>
          <div className={`mb-3 flex items-center justify-end gap-3 text-xs ${featuredTheme.muted}`}>
            {user ? (
              <>
                <span>{user.nickname}님</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-auto p-0 font-semibold hover:bg-transparent hover:opacity-80"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-semibold hover:bg-transparent hover:opacity-80"
              >
                <Link to="/">로그인하기</Link>
              </Button>
            )}
          </div>
          <p className={`text-sm font-semibold ${featuredTheme.accent}`}>
            매일 한 편 · 이번 시즌은 {featuredTheme.label}
          </p>
          <h1 className={`mt-3 text-2xl font-bold tracking-normal sm:text-3xl ${featuredTheme.heading}`}>
            하루 한 편, 오늘의 이야기
          </h1>
          <p className={`mt-3 max-w-2xl text-sm leading-6 ${featuredTheme.muted}`}>{featuredTheme.tagline}</p>
        </Card>

        {renderContent()}

        <div ref={sentinelRef} />

        {isFetchingNextPage && <Skeleton className={`h-24 rounded-lg ${featuredTheme.placeholder}`} />}
      </div>
    </main>
  );
}

export default Posts;
