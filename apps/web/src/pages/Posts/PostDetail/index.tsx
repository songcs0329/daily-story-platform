import { Link, useParams } from 'react-router';
import CommentSection from './CommentSection';
import useGetPost from '@/hooks/useGetPost';
import { getGenreTheme } from '@/libs/utils/genreTheme';

function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = postId ? Number(postId) : undefined;
  const isValidPostId = Number.isInteger(postIdNumber) && Number(postIdNumber) > 0;
  const { data: post, isLoading, isError } = useGetPost(isValidPostId ? postIdNumber : undefined);

  const featuredTheme = getGenreTheme(post?.genre);

  const renderContent = () => {
    if (!isValidPostId) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          URL의 id가 올바르지 않습니다. 예시로 <span className="font-semibold">/posts/1</span>처럼 숫자 ID를 입력해
          주세요.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="grid gap-4">
          <div className={`aspect-video w-full animate-pulse rounded-lg ${featuredTheme.placeholder}`} />
          <div className={`h-6 w-2/3 animate-pulse rounded ${featuredTheme.placeholder}`} />
          <div className={`h-40 animate-pulse rounded-lg ${featuredTheme.placeholder}`} />
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

    if (!post) {
      return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">
          해당 이야기를 찾을 수 없습니다.
        </div>
      );
    }

    return (
      <article className="grid gap-5">
        <div className={`aspect-video w-full overflow-hidden rounded-lg ${featuredTheme.placeholder}`}>
          <img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover" />
        </div>

        <div>
          <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${featuredTheme.badge}`}>
            {featuredTheme.label}
          </span>
          <h1 className={`mt-3 text-2xl font-bold tracking-normal sm:text-3xl ${featuredTheme.heading}`}>
            {post.title}
          </h1>
          <div className={`mt-2 flex items-center gap-3 text-xs ${featuredTheme.muted}`}>
            <span>{new Date(post.publishedAt).toLocaleDateString('ko-KR')}</span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>

        <div className={`grid gap-4 text-sm leading-7 ${featuredTheme.body}`}>
          {post.content
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
        </div>
      </article>
    );
  };

  return (
    <main className={`min-h-screen px-4 py-6 sm:px-8 sm:py-8 ${featuredTheme.pageBg}`}>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <Link
          className={`inline-block py-2 text-sm font-semibold transition hover:opacity-80 ${featuredTheme.accent}`}
          to="/posts"
        >
          목록으로 돌아가기
        </Link>

        <section className={`rounded-lg border p-6 shadow-sm sm:p-8 ${featuredTheme.surface}`}>
          {renderContent()}
        </section>

        {isValidPostId && post && <CommentSection postId={post.id} theme={featuredTheme} />}
      </div>
    </main>
  );
}

export default PostDetail;
