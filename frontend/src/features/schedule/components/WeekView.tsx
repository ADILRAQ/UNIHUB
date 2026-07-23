import ScheduleItemCard from './ScheduleItemCard';
import { formatWeekdayDay } from '../calendar';
import type { DayBucket } from '../hooks/useCalendar';
import type { ScheduleItem } from '../types';

interface WeekViewProps {
  columns: DayBucket[];
  canManage: boolean;
  onManage: (item: ScheduleItem) => void;
}

/**
 * Seven-column week grid (Monday-first). Each column lists that day's items as
 * full cards; today's column is highlighted. Horizontally scrollable on narrow
 * screens. Pure UI — columns come from `useCalendar`.
 */
const WeekView = ({ columns, canManage, onManage }: WeekViewProps) => (
  <div className="sched-week-wrap">
    <div className="sched-week">
      {columns.map((col) => (
        <div
          key={col.iso}
          className={`sched-week__col${col.isToday ? ' sched-week__col--today' : ''}`}
        >
          <div className="sched-week__head">{formatWeekdayDay(col.date)}</div>
          <div className="sched-week__body">
            {col.items.length === 0 ? (
              <p className="sched-week__empty">—</p>
            ) : (
              col.items.map((item) => (
                <ScheduleItemCard
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  canManage={canManage}
                  onManage={onManage}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WeekView;
