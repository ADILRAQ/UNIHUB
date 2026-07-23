import ScheduleItemCard from './ScheduleItemCard';
import { formatDateLong } from '../calendar';
import type { DayBucket } from '../hooks/useCalendar';
import type { ScheduleItem } from '../types';

interface TodayViewProps {
  todayItems: ScheduleItem[];
  upcoming: DayBucket[];
  canManage: boolean;
  onManage: (item: ScheduleItem) => void;
}

/**
 * "What's next" landing view: today's sessions/events first (each session with a
 * Join Meet button via `ScheduleItemCard`), then a grouped "Coming up" list of the
 * next days that have anything scheduled. Pure UI — data comes from `useCalendar`.
 */
const TodayView = ({ todayItems, upcoming, canManage, onManage }: TodayViewProps) => (
  <div className="sched-today">
    <section>
      <h2 className="sched-today__heading">Today</h2>
      {todayItems.length === 0 ? (
        <p className="sched-empty">Nothing scheduled today.</p>
      ) : (
        <div className="sched-list">
          {todayItems.map((item) => (
            <ScheduleItemCard
              key={`${item.kind}-${item.id}`}
              item={item}
              canManage={canManage}
              onManage={onManage}
            />
          ))}
        </div>
      )}
    </section>

    <section>
      <h2 className="sched-today__heading">Coming up</h2>
      {upcoming.length === 0 ? (
        <p className="sched-empty">Nothing in the next two weeks.</p>
      ) : (
        upcoming.map((bucket) => (
          <div key={bucket.iso} className="sched-today__day">
            <h3 className="sched-today__day-label">{formatDateLong(bucket.date)}</h3>
            <div className="sched-list">
              {bucket.items.map((item) => (
                <ScheduleItemCard
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  canManage={canManage}
                  onManage={onManage}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  </div>
);

export default TodayView;
