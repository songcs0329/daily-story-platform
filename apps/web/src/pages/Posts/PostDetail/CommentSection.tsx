import { useState } from 'react';
import { Link } from 'react-router';
import CommentItem from './CommentItem';
import type { GenreTheme } from '@/libs/utils/genreTheme';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import useCreateComment from '@/hooks/useCreateComment';
import useDeleteComment from '@/hooks/useDeleteComment';
import useGetComments from '@/hooks/useGetComments';
import useAuthStore from '@/stores/useAuthStore';

interface CommentSectionProps {
  postId: number;
  theme: GenreTheme;
}

function CommentSection({ postId, theme }: CommentSectionProps) {
  const { data: comments, isLoading } = useGetComments(postId);
  const user = useAuthStore((state) => state.user);
  const createComment = useCreateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const [content, setContent] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    createComment.mutate(trimmed, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <Card className={`gap-0 rounded-lg border p-6 shadow-sm sm:p-8 ${theme.surface}`}>
      <h2 className={`text-lg font-bold tracking-normal ${theme.heading}`}>댓글 {comments?.length ?? 0}개</h2>

      {isLoading ? (
        <Skeleton className={`mt-4 h-20 rounded-lg ${theme.placeholder}`} />
      ) : (
        <ul className="mt-4">
          {comments?.length ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                theme={theme}
                canDelete={user?.id === comment.author.id}
                isDeleting={deleteComment.isPending}
                onDelete={() => deleteComment.mutate(comment.id)}
              />
            ))
          ) : (
            <li className={`text-sm ${theme.muted}`}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</li>
          )}
        </ul>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-2">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="댓글을 남겨보세요"
            rows={3}
            className={`text-sm leading-6 ${theme.surface} ${theme.body}`}
          />
          <Button
            type="submit"
            disabled={createComment.isPending || !content.trim()}
            className={`h-auto w-fit px-4 py-2 text-sm font-semibold ${theme.badge}`}
          >
            댓글 작성
          </Button>
        </form>
      ) : (
        <p className={`mt-5 text-sm ${theme.muted}`}>
          <Link to="/" className={`font-semibold ${theme.accent}`}>
            로그인
          </Link>{' '}
          후 댓글을 작성할 수 있어요.
        </p>
      )}
    </Card>
  );
}

export default CommentSection;
