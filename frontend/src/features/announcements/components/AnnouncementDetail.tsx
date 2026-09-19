/**
 * Announcement detail view — artboard design.
 * Renders server-sanitized bodyHtml safely and shows the comments thread.
 * For authors and admins also shows Pin and Urgent toggles.
 */
import { useQueryClient } from '@tanstack/react-query';
import CommentsThread from './CommentsThread';
import * as announcementService from '../services/announcementService';
import type { AnnouncementDto } from '../types';

interface Props {
  announcement: AnnouncementDto;
  onBack: () => void;
  currentUserId: number;
  currentUserRole: string;
}

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const AnnouncementDetail = ({ announcement, currentUserId, currentUserRole }: Props) => {
  const queryClient = useQueryClient();
  const isAdmin = currentUserRole === 'ADMIN';
  const isAuthor = announcement.authorId === currentUserId;
  const canToggle = isAdmin || (currentUserRole === 'TEACHER' && isAuthor);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['announcements', announcement.id] });
    void queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  return (
    <>
      {/* Article card */}
      <article
        style={{
          background: '#FFFFFF',
          border: '1px solid #EDEBF8',
          borderRadius: 16,
          padding: '40px 44px',
          boxShadow: '0 1px 2px rgba(108,99,255,0.05), 0 8px 22px rgba(108,99,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 11px', borderRadius: 999, background: '#EEEDFF', color: '#4A41C9', fontSize: 12, fontWeight: 600 }}>
              {announcement.classGroupName ?? 'All groups'}
            </span>
            {announcement.pinned && (
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 11px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600 }}>Pinned</span>
            )}
            {announcement.urgent && (
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 11px', borderRadius: 999, background: '#FEE2E2', color: '#991B1B', fontSize: 12, fontWeight: 600 }}>Urgent</span>
            )}
          </div>

          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {announcement.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EEEDFF', color: '#4A41C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {getInitials(announcement.authorName)}
            </div>
            <span style={{ fontSize: 13.5, color: '#45435A', fontWeight: 600 }}>{announcement.authorName}</span>
            <span style={{ fontSize: 13.5, color: '#8D8B9C' }}>·</span>
            <span style={{ fontSize: 13.5, color: '#6B6B7B' }}>{formatDate(announcement.createdAt)}</span>
            {announcement.editedAt && (
              <span style={{ fontSize: 12.5, color: '#8D8B9C' }}>(edited)</span>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: '#F0EEFA' }} />

        {/* Server-sanitized HTML from backend — safe per CLAUDE.md */}
        <div
          className="ann-prose"
          style={{ fontSize: 15.5, lineHeight: 1.75, color: '#33314A' }}
          dangerouslySetInnerHTML={{ __html: announcement.bodyHtml }}
        />

        {/* Pin / Urgent toggles */}
        {canToggle && (
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => void announcementService.pinAnnouncement(announcement.id, !announcement.pinned).then(invalidate)}
              style={{ height: 36, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 9, background: announcement.pinned ? '#EEEDFF' : '#FFFFFF', color: announcement.pinned ? '#4A41C9' : '#45435A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {announcement.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              type="button"
              onClick={() => void announcementService.setUrgent(announcement.id, !announcement.urgent).then(invalidate)}
              style={{ height: 36, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 9, background: announcement.urgent ? '#FEE2E2' : '#FFFFFF', color: announcement.urgent ? '#991B1B' : '#45435A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {announcement.urgent ? 'Not urgent' : 'Urgent'}
            </button>
          </div>
        )}
      </article>

      {/* Comments section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F1B33' }}>
          {announcement.commentCount} comment{announcement.commentCount !== 1 ? 's' : ''}
        </h2>
        <CommentsThread
          announcementId={announcement.id}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      </section>
    </>
  );
};

export default AnnouncementDetail;
