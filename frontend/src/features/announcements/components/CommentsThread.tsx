/**
 * Comments thread for an announcement detail.
 * Lists comments (oldest first, paginated), and provides a form for new comments.
 */
import useComments from '../hooks/useComments';

interface Props {
  announcementId: number;
  currentUserId: number;
  currentUserRole: string;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const CommentsThread = ({ announcementId, currentUserId, currentUserRole }: Props) => {
  const {
    comments,
    totalPages,
    page,
    onNextPage,
    onPrevPage,
    newComment,
    onCommentChange,
    onSubmit,
    onDelete,
    isSubmitting,
    isLoading,
    isError,
    canDelete,
  } = useComments({ announcementId, currentUserId, currentUserRole });

  return (
    <section className="ann-comments">
      <h4 className="ann-comments__heading">Comments</h4>

      {isLoading && <p className="ann-comments__state">Loading comments&hellip;</p>}
      {isError && (
        <p className="ann-comments__state ann-comments__state--error">
          Failed to load comments.
        </p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="ann-comments__state">No comments yet. Be the first!</p>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="ann-comment">
          <p className="ann-comment__meta">
            <strong>{comment.authorName}</strong> &middot; {formatDate(comment.createdAt)}
          </p>
          <p className="ann-comment__content">{comment.content}</p>
          {canDelete(comment) && (
            <button
              type="button"
              className="ann-comment__delete"
              onClick={() => onDelete(comment.id)}
              aria-label="Delete comment"
            >
              Delete
            </button>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="ann-pagination">
          <button type="button" onClick={onPrevPage} disabled={page === 0}>
            Previous
          </button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <button type="button" onClick={onNextPage} disabled={page >= totalPages - 1}>
            Next
          </button>
        </div>
      )}

      <div className="ann-form">
        <textarea
          className="ann-form__textarea"
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Write a comment&hellip;"
          rows={3}
          maxLength={2000}
        />
        <button
          type="button"
          className="ann-form__submit"
          onClick={onSubmit}
          disabled={isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </section>
  );
};

export default CommentsThread;
