import type { Comment } from 'shared';
import type { GenreTheme } from '@/libs/utils/genreTheme';

interface CommentItemProps {
  comment: Comment;
  theme: GenreTheme;
  canDelete: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

function CommentItem({ comment, theme, canDelete, onDelete, isDeleting }: CommentItemProps) {
  return (
    <li className="grid gap-1 border-b border-current/10 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm font-semibold ${theme.heading}`}>{comment.author.nickname}</span>
        <div className={`flex items-center gap-3 text-xs ${theme.muted}`}>
          <span>{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="font-semibold transition hover:opacity-80 disabled:opacity-50"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <p className={`text-sm leading-6 whitespace-pre-wrap ${theme.body}`}>{comment.content}</p>
    </li>
  );
}

export default CommentItem;
