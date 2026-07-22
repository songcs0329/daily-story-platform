import { Link } from 'react-router';
import useGetPosts from '@/hooks/useGetPosts';

const genreLabels = {
  horror: '공포',
  romance: '로맨스',
} as const;

function Posts() {
  const { data: posts, isLoading, isError } = useGetPosts();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.id}`}
            className="group grid overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-500 hover:shadow-md"
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
              <span className="inline-flex w-fit rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {genreLabels[post.genre]}
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
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-emerald-700">Daily Story</p>
          <h1 className="mt-3 text-2xl font-bold tracking-normal text-zinc-950 sm:text-3xl">오늘의 이야기</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">매일 새로 쓰인 단편 소설을 만나보세요.</p>
        </section>

        {renderContent()}
      </div>
    </main>
  );
}

export default Posts;
