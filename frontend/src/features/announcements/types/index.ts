/** Announcements feature types. */

export interface AnnouncementDto {
  id: number;
  authorId: number;
  authorName: string;
  classGroupId: number | null;
  classGroupName: string | null;
  title: string;
  /** Already sanitized server-side with Jsoup — safe to use with dangerouslySetInnerHTML. */
  bodyHtml: string;
  pinned: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  commentCount: number;
  read: boolean;
}

export interface CommentDto {
  id: number;
  announcementId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AnnouncementFilters {
  classGroupId?: number;
  urgent?: boolean;
  unread?: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string; // raw HTML from TipTap
  classGroupId: number | null; // null = department-wide
  pinned: boolean;
  urgent: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  body?: string; // raw HTML from TipTap
}

export interface ClassGroupOption {
  id: number;
  name: string;
}
