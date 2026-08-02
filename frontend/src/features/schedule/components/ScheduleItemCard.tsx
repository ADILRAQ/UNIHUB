import { formatTimeRange, parseISODate, formatDateLong } from '../calendar';
import { itemVisual } from '../itemStyle';
import type { ScheduleItem } from '../types';

interface ScheduleItemCardProps {
  item: ScheduleItem;
  /** Whether the viewer may cancel/reschedule sessions. */
  canManage: boolean;
  /** Open the cancel/reschedule dialog for this session. */
  onManage?: (item: ScheduleItem) => void;
}

/**
 * Full presentation of one schedule item, shared by the Today, Coming-up and Week
 * views. Renders the badge/colour from `itemVisual`, the resolved Join Meet button
 * for sessions, and — for cancelled/rescheduled sessions — the change note and
 * original date. All server text (`changeNote`, `description`) is rendered as
 * plain text; never as HTML. No logic beyond presentation lives here.
 */
const ScheduleItemCard = ({ item, canManage, onManage }: ScheduleItemCardProps) => {
  const visual = itemVisual(item);
  const canJoin = visual.isSession && !visual.isCancelled && Boolean(item.meetLink);
  const canManageThis =
    canManage && visual.isSession && item.status !== 'CANCELLED' && Boolean(onManage);

  return (
    <article className={`sched-item sched-item--${visual.variant}`}>
      <div className="sched-item__head">
        <span className={`sched-badge sched-badge--${visual.variant}`}>{visual.badge}</span>
        <span className="sched-item__time">{formatTimeRange(item.startTime, item.endTime)}</span>
      </div>

      <h3 className={`sched-item__title${visual.isCancelled ? ' sched-item__title--cancelled' : ''}`}>
        {item.title}
      </h3>

      <div className="sched-item__meta">
        {item.room && <span>Room {item.room}</span>}
        {item.kind === 'SESSION' && item.classGroupName && <span>{item.classGroupName}</span>}
        {item.kind === 'EVENT' && item.courseName && <span>{item.courseName}</span>}
        {item.kind === 'EVENT' && !item.courseName && item.classGroupName && (
          <span>{item.classGroupName}</span>
        )}
      </div>

      {item.status === 'RESCHEDULED' && item.originalDate && (
        <p className="sched-item__note">
          Moved from {formatDateLong(parseISODate(item.originalDate))}
          {item.changeNote ? ` — ${item.changeNote}` : ''}
        </p>
      )}

      {item.status === 'CANCELLED' && item.changeNote && (
        <p className="sched-item__note">Reason: {item.changeNote}</p>
      )}

      {item.kind === 'EVENT' && item.description && (
        <p className="sched-item__note">{item.description}</p>
      )}

      {(canJoin || canManageThis) && (
        <div className="sched-item__actions">
          {canJoin && (
            <a
              className="sched-btn sched-btn--join"
              href={item.meetLink ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Meet
            </a>
          )}
          {canManageThis && (
            <button
              type="button"
              className="sched-btn"
              onClick={() => onManage?.(item)}
            >
              Cancel / reschedule
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default ScheduleItemCard;
