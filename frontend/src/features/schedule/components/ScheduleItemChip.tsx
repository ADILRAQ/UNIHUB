import { formatTime } from '../calendar';
import { itemVisual } from '../itemStyle';
import type { ScheduleItem } from '../types';

interface ScheduleItemChipProps {
  item: ScheduleItem;
  /** Whether the viewer may cancel/reschedule sessions. */
  canManage: boolean;
  /** Open the cancel/reschedule dialog for this session. */
  onManage?: (item: ScheduleItem) => void;
}

/**
 * Compact one-line chip for dense grids (the Month view). Colour-coded by
 * `itemVisual`; a manageable session renders as a button that opens the cancel/
 * reschedule dialog, everything else as a static span. Cancelled sessions stay
 * visible with a strikethrough.
 */
const ScheduleItemChip = ({ item, canManage, onManage }: ScheduleItemChipProps) => {
  const visual = itemVisual(item);
  const time = formatTime(item.startTime);
  const label = `${time ? `${time} ` : ''}${item.title}`;
  const className = `sched-chip sched-chip--${visual.variant}${
    visual.isCancelled ? ' sched-chip--struck' : ''
  }`;
  const interactive =
    canManage && visual.isSession && item.status !== 'CANCELLED' && Boolean(onManage);

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
