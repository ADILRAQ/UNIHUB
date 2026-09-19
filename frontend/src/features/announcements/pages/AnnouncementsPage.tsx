/**
 * Announcements feed page.
 * All logic is delegated to useFeed; this component is thin UI only.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useFeed from '../hooks/useFeed';
import usePostData from '../../../hooks/usePostData';
import { deleteAnnouncement } from '../services/announcementService';
import PageHeader from '../../../components/layout/PageHeader';

// ── Skeleton card ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div
    aria-hidden="true"
    style={{
      background: '#FFFFFF',
      border: '1px solid #EDEBF8',
      borderRadius: 14,
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', gap: 10 }}>
      <div className="skeleton" style={{ width: 84, height: 22, borderRadius: 999 }} />
      <div className="skeleton" style={{ width: 160, height: 22 }} />
    </div>
    <div className="skeleton" style={{ width: '62%', height: 22 }} />
    <div className="skeleton" style={{ width: '100%', height: 14 }} />
    <div className="skeleton" style={{ width: '78%', height: 14 }} />
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '72px 24px' }}>
    <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFEDFA', color: '#8D8B9C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2h2.1L13 19V5l-6.2 4H4.7a1.2 1.2 0 0 0-1.2 1.2Z"/>
        <path d="M17.5 8.6a4.6 4.6 0 0 1 0 6.8"/>
      </svg>
    </span>
    <span style={{ fontSize: 16, fontWeight: 600, color: '#45435A' }}>Nothing matches those filters</span>
    <span style={{ fontSize: 14, color: '#6B6B7B', textAlign: 'center', maxWidth: 380, lineHeight: 1.55 }}>
      Try another class group, or clear the search to see every announcement again.
    </span>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    announcements,
    totalPages,
    page,
    isLoading,
    isError,
    onNextPage,
    onPrevPage,
    onFilterChange,
  } = useFeed();

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const canPost = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const { mutate: doDelete } = usePostData<string, number, void>({
    keys: ['announcements', 'delete'],
    serviceFn: deleteAnnouncement,
    onSuccessFn: () => {
      setConfirmDeleteId(null);
      onFilterChange({});
    },
  });

  const headerActions = canPost ? (
    <button
      type="button"
      onClick={() => navigate('/announcements/new')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: 0, borderRadius: 10, background: '#5A4FE0', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5.5v13M5.5 12h13"/>
      </svg>
      New announcement
    </button>
  ) : undefined;

  return (
    <>
      <PageHeader title="Announcements" actions={headerActions} />

      <main style={{ flexGrow: 1, boxSizing: 'border-box', padding: '36px 32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Filter bar */}
          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #EDEBF8',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: '0 1px 2px rgba(108,99,255,0.05)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 220, flexShrink: 0 }}>
              <label htmlFor="ann-group" style={{ fontSize: 12.5, fontWeight: 600, color: '#45435A' }}>Class group</label>
              <div style={{ position: 'relative', display: 'flex' }}>
                <select
                  id="ann-group"
                  onChange={e => {
                    const v = e.target.value;
                    onFilterChange({ classGroupId: v === 'all' ? undefined : Number(v) });
                  }}
                  style={{ width: '100%', height: 44, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 38px 0 13px', fontSize: 14.5, color: '#1F1B33', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="all">All class groups</option>
                </select>
                <span style={{ position: 'absolute', right: 13, top: 14, color: '#6B6B7B', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9.5 6 6 6-6"/>
                  </svg>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1, minWidth: 0 }}>
              <label htmlFor="ann-search" style={{ fontSize: 12.5, fontWeight: 600, color: '#45435A' }}>Search</label>
              <div style={{ position: 'relative', display: 'flex' }}>
                <span style={{ position: 'absolute', left: 13, top: 13, color: '#6B6B7B', pointerEvents: 'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>
                  </svg>
                </span>
                <input
                  id="ann-search"
                  type="search"
                  placeholder="Title, author or text"
                  style={{ width: '100%', height: 44, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', padding: '0 14px 0 40px', fontSize: 14.5, color: '#1F1B33' }}
                />
              </div>
            </div>

            <span style={{ fontSize: 13, color: '#6B6B7B', paddingBottom: 13, whiteSpace: 'nowrap' }}>
              {announcements.length} result{announcements.length !== 1 ? 's' : ''}
            </span>
          </section>

          {/* Error */}
          {isError && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>
              Failed to load announcements. Please try again.
            </div>
          )}

          {/* Content */}
          {!isError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {isLoading && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}

              {!isLoading && announcements.length === 0 && <EmptyState />}

              {!isLoading && announcements.map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #EDEBF8',
                    borderRadius: 14,
                    padding: '22px 24px',
                    boxShadow: '0 1px 2px rgba(108,99,255,0.05), 0 6px 20px rgba(108,99,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 999, background: '#EEEDFF', color: '#4A41C9', fontSize: 11.5, fontWeight: 600 }}>
                          {item.classGroupName ?? 'All groups'}
                        </span>
                        <span style={{ fontSize: 13, color: '#6B6B7B' }}>
                          {item.authorName} · {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/announcements/${item.id}`)}
                        style={{ fontSize: 19, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.015em', textDecoration: 'none', lineHeight: 1.35, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                      >
                        {item.title}
                      </button>
                    </div>

                    {canPost && (
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/announcements/${item.id}/edit`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 13px', border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', color: '#45435A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17V20Z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 13px', border: '1px solid #F3D3D3', borderRadius: 9, background: '#FFFFFF', color: '#B02F2F', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 6.5h16"/>
                            <path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7"/>
                            <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const stripped = item.bodyHtml.replace(/<[^>]+>/g, ' ');
                    return (
                      <div
                        style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: '#55536B' }}
                        // ponytail: server-sanitized HTML from backend — safe per CLAUDE.md
                        dangerouslySetInnerHTML={{ __html: stripped.slice(0, 220) + (stripped.length > 220 ? '…' : '') }}
                      />
                    );
                  })()}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#6B6B7B' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.5 11.6a7.6 7.6 0 0 1-10.6 7L4 20.5l1.9-5.7a7.6 7.6 0 1 1 14.6-3.2Z"/>
                    </svg>
                    <span style={{ fontSize: 13 }}>{item.commentCount} comment{item.commentCount !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Delete confirmation */}
                  {confirmDeleteId === item.id && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#FEF2F2', border: '1px solid #F7C7C7', borderRadius: 10, padding: '12px 14px' }}>
                      <span style={{ fontSize: 13.5, color: '#B02F2F' }}>Delete this announcement and its comments? This can&apos;t be undone.</span>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ height: 38, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', color: '#45435A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => doDelete(item.id)}
                          style={{ height: 38, padding: '0 14px', border: 0, borderRadius: 9, background: '#C62828', color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
              <button
                type="button"
                onClick={onPrevPage}
                disabled={page === 0}
                style={{ height: 40, padding: '0 18px', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', color: '#45435A', fontSize: 14, fontWeight: 600, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ fontSize: 13.5, color: '#6B6B7B' }}>Page {page + 1} / {totalPages}</span>
              <button
                type="button"
                onClick={onNextPage}
                disabled={page >= totalPages - 1}
                style={{ height: 40, padding: '0 18px', border: '1px solid #E1DEF2', borderRadius: 10, background: '#FFFFFF', color: '#45435A', fontSize: 14, fontWeight: 600, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AnnouncementsPage;
