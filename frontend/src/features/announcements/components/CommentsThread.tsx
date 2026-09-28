/**
 * Comments thread for an announcement detail — artboard design.
 */
import useComments from '../hooks/useComments';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  announcementId: number;
  currentUserId: number;
  currentUserRole: string;
}

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

const avatarStyle = {
  width: 34, height: 34, flexShrink: 0, borderRadius: 'var(--radius-full)',
  background: 'var(--orange-100)', color: 'var(--orange-700)',
  display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
} as const;

const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CommentsThread = ({ announcementId, currentUserId, currentUserRole }: Props) => {
  const { user } = useAuth();
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
    leavingIds,
  } = useComments({ announcementId, currentUserId, currentUserRole });

  const myInitials = user ? getInitials(user.fullName) : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isLoading && (
        <>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
              <div className="skeleton" style={{ flexGrow: 1, height: 70, borderRadius: 'var(--radius-md)' }} />
            </div>
          ))}
        </>
      )}

      {isError && (
        <p className="alert" role="alert">Failed to load comments.</p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="fade-in" style={{ margin: 0, fontSize: 14, color: 'var(--ink-500)' }}>No comments yet. Be the first!</p>
      )}

      {comments.map((comment) => {
        return (
          // New comments slide in on mount; deleted ones fade out until the refetch drops them.
          <div key={comment.id} className={leavingIds.has(comment.id) ? 'leave-up' : 'enter-up'} style={{ display: 'flex', gap: 12 }}>
            <div style={avatarStyle}>{getInitials(comment.authorName)}</div>
            <div
              style={{
                flexGrow: 1, minWidth: 0,
                background: 'var(--cream-100)',
                borderRadius: 'var(--radius-lg)', padding: '12px 16px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{comment.authorName}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>{formatTime(comment.createdAt)}</span>
                </div>
                {canDelete(comment) && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onDelete(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-700)' }}>{comment.content}</p>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn btn--sm" onClick={onPrevPage} disabled={page === 0}>Previous</button>
          <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Page {page + 1} / {totalPages}</span>
          <button type="button" className="btn btn--sm" onClick={onNextPage} disabled={page >= totalPages - 1}>Next</button>
        </div>
      )}

      {/* New comment form */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 6 }}>
        <div style={avatarStyle}>{myInitials}</div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            rows={3}
            placeholder="Add a comment…"
            value={newComment}
            onChange={e => onCommentChange(e.target.value)}
            maxLength={2000}
            aria-label="Add a comment"
            className="textarea"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="btn btn--primary"
            style={{ alignSelf: 'flex-end' }}
          >
            {isSubmitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsThread;
