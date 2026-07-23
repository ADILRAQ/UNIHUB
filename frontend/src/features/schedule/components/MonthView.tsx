import ScheduleItemChip from './ScheduleItemChip';
import { WEEKDAY_LABELS } from '../calendar';
import type { MonthCell } from '../hooks/useCalendar';
import type { ScheduleItem } from '../types';

interface MonthViewProps {
  weeks: MonthCell[][];
  canManage: boolean;
  onManage: (item: ScheduleItem) => void;
}

/**
 * Month grid: a Monday-first header row plus whole weeks of day cells. Days
 * outside the displayed month are dimmed; today is highlighted. Each cell shows
 * its items as compact colour-coded chips. Pure UI — the grid comes from
 * `useCalendar`.
 */
const MonthView = ({ weeks, canManage, onManage }: MonthViewProps) => (
  <div className="sched-month-wrap">
    <div className="sched-month">
      <div className="sched-month__head">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="sched-month__head-cell">
            {label}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week[0].iso} className="sched-month__row">
          {week.map((cell) => (
            <div
              key={cell.iso}
              className={`sched-month__cell${cell.inMonth ? '' : ' sched-month__cell--muted'}${
                cell.isToday ? ' sched-month__cell--today' : ''
              }`}
            >
              <div className="sched-month__date">{cell.date.getDate()}</div>
              <div className="sched-month__items">
                {cell.items.map((item) => (
                  <ScheduleItemChip
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    canManage={canManage}
                    onManage={onManage}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default MonthView;
