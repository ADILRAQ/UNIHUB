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

const AVATAR_COLORS = ['#EEEDFF:#4A41C9', '#FFE8E8:#B02F2F', '#E8F5FF:#1D4ED8', '#E8FFF0:#065F46'];
const avatarStyle = (name: string) => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const [bg, color] = AVATAR_COLORS[idx].split(':');
  return { bg, color };
};

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
  } = useComments({ announcementId, currentUserId, currentUserRole });

  const myInitials = user ? getInitials(user.fullName) : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isLoading && (
        <>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
              <div className="skeleton" style={{ flexGrow: 1, height: 70, borderRadius: 12 }} />
            </div>
          ))}
        </>
      )}

      {isError && (
        <p style={{ margin: 0, fontSize: 13.5, color: '#B91C1C' }}>Failed to load comments.</p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>No comments yet. Be the first!</p>
      )}

      {comments.map((comment) => {
        const av = avatarStyle(comment.authorName);
        return (
          <div key={comment.id} style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
                background: av.bg, color: av.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}
            >
              {getInitials(comment.authorName)}
            </div>
            <div
              style={{
                flexGrow: 1, minWidth: 0,
                background: '#FFFFFF', border: '1px solid #EDEBF8',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1F1B33' }}>{comment.authorName}</span>
                  <span style={{ fontSize: 12, color: '#8D8B9C' }}>{formatTime(comment.createdAt)}</span>
                </div>
                {canDelete(comment) && (
                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: '#8D8B9C' }}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#45435A' }}>{comment.content}</p>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={onPrevPage} disabled={page === 0} style={{ fontSize: 13, color: '#4A41C9', background: 'none', border: 'none', cursor: 'pointer', opacity: page === 0 ? 0.4 : 1 }}>← Prev</button>
          <span style={{ fontSize: 12.5, color: '#6B6B7B' }}>Page {page + 1} / {totalPages}</span>
          <button type="button" onClick={onNextPage} disabled={page >= totalPages - 1} style={{ fontSize: 13, color: '#4A41C9', background: 'none', border: 'none', cursor: 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}>Next →</button>
        </div>
      )}

      {/* New comment form */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 6 }}>
        <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', background: '#EEEDFF', color: '#4A41C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
          {myInitials}
        </div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            rows={3}
            placeholder="Add a comment…"
            value={newComment}
            onChange={e => onCommentChange(e.target.value)}
            maxLength={2000}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid #E1DEF2', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !newComment.trim()}
            style={{ alignSelf: 'flex-end', height: 40, padding: '0 18px', border: 0, borderRadius: 9, background: isSubmitting || !newComment.trim() ? '#8A84E8' : '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, cursor: isSubmitting || !newComment.trim() ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsThread;
