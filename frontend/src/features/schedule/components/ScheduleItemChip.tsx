import { formatTime } from '../calendar';
import { itemVisual } from '../itemStyle';
import type { ScheduleItem } from '../types';

interface ScheduleItemChipProps {
  item: ScheduleItem;
  canManage: boolean;
  onManage?: (item: ScheduleItem) => void;
  /** 'week' renders a two-line card-chip with border-left accent; default is the compact month chip. */
  layout?: 'week';
}

/**
 * Compact one-line chip for dense grids (the Month view). Colour-coded by
 * `itemVisual`; a manageable session renders as a button that opens the cancel/
 * reschedule dialog, everything else as a static span. Cancelled sessions stay
 * visible with a strikethrough.
 */
const ScheduleItemChip = ({ item, canManage, onManage, layout }: ScheduleItemChipProps) => {
  const visual = itemVisual(item);
  const time = formatTime(item.startTime);
  const interactive =
    canManage && visual.isSession && item.status !== 'CANCELLED' && Boolean(onManage);

  if (layout === 'week') {
    const cls = `sched-chip sched-chip--${visual.variant} sched-chip--week${
      visual.isCancelled ? ' sched-chip--struck' : ''
    }${interactive ? ' sched-chip--button' : ''}`;
    const content = (
      <>
        <span className="sched-chip__week-title">{item.title}</span>
        {time && <span className="sched-chip__week-time">{time}</span>}
        {visual.variant === 'rescheduled' && (
          <span className="sched-chip__week-moved">MOVED</span>
        )}
      </>
    );
    return interactive ? (
      <button type="button" className={cls} onClick={() => onManage?.(item)}>{content}</button>
    ) : (
      <div className={cls}>{content}</div>
    );
  }

  const label = `${time ? `${time} ` : ''}${item.title}`;
  const className = `sched-chip sched-chip--${visual.variant}${
    visual.isCancelled ? ' sched-chip--struck' : ''
  }`;

  if (interactive) {
    return (
      <button
        type="button"
        className={`${className} sched-chip--button`}
        title={`${label} — cancel / reschedule`}
        onClick={() => onManage?.(item)}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={className} title={label}>
      {label}
    </span>
  );
};

export default ScheduleItemChip;
