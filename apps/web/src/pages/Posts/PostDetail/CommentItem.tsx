import type { Comment } from 'shared';
import type { GenreTheme } from '@/libs/utils/genreTheme';
import { Button } from '@/components/ui/button';

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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-auto p-0 font-semibold hover:bg-transparent hover:opacity-80"
            >
              삭제
            </Button>
          )}
        </div>
      </div>
      <p className={`text-sm leading-6 whitespace-pre-wrap ${theme.body}`}>{comment.content}</p>
    </li>
  );
}

export default CommentItem;
