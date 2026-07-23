import useCalendar from '../hooks/useCalendar';
import TodayView from '../components/TodayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import CancelRescheduleDialog from '../components/CancelRescheduleDialog';
import type { CalendarView } from '../types';

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/**
 * The calendar page (all authenticated users). Thin UI over `useCalendar`: a
 * view switcher (Today / Week / Month), prev/next/today navigation, and the
 * matching view rendered from the merged schedule feed. Teachers/admins can open
 * the cancel/reschedule dialog on a session.
 */
const CalendarPage = () => {
  const c = useCalendar();

  return (
    <section className="sched-page">
      <header className="sched-page__head">
        <div className="sched-viewswitch" role="tablist" aria-label="Calendar view">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v.value}
              type="button"
              role="tab"
              aria-selected={c.view === v.value}
              className={`sched-viewswitch__btn${c.view === v.value ? ' sched-viewswitch__btn--active' : ''}`}
              onClick={() => c.onSelectView(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="sched-nav">
          {c.showNav && (
            <>
              <button type="button" className="sched-btn sched-btn--sm" aria-label="Previous" onClick={c.onPrev}>
                ‹
              </button>
              <button type="button" className="sched-btn sched-btn--sm" onClick={c.onToday}>
                Today
              </button>
              <button type="button" className="sched-btn sched-btn--sm" aria-label="Next" onClick={c.onNext}>
                ›
              </button>
            </>
          )}
        </div>
      </header>

      <h1 className="sched-page__label">{c.label}</h1>

      {c.isLoading && <p className="sched-empty">Loading your schedule…</p>}
      {c.isError && <p className="sched-error">Couldn&apos;t load your schedule. Please try again.</p>}

      {!c.isLoading && !c.isError && (
        <>
          {c.view === 'today' && (
            <TodayView
              todayItems={c.todayItems}
              upcoming={c.upcoming}
              canManage={c.canManage}
              onManage={c.onManageSession}
            />
          )}
          {c.view === 'week' && (
            <WeekView columns={c.weekColumns} canManage={c.canManage} onManage={c.onManageSession} />
          )}
          {c.view === 'month' && (
            <MonthView weeks={c.monthWeeks} canManage={c.canManage} onManage={c.onManageSession} />
          )}
        </>
      )}

      {c.dialogSession && (
        <CancelRescheduleDialog session={c.dialogSession} onClose={c.onCloseDialog} />
      )}
    </section>
  );
};

export default CalendarPage;
