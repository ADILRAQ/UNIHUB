import useCalendar from '../hooks/useCalendar';
import TodayView from '../components/TodayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import CancelRescheduleDialog from '../components/CancelRescheduleDialog';
import PageHeader from '../../../components/layout/PageHeader';
import type { CalendarView } from '../types';

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/**
 * Calendar page — artboard design.
 * Thin UI over useCalendar: view switcher pill, prev/next nav, and the view content.
 */
const CalendarPage = () => {
  const c = useCalendar();

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* View switcher pill */}
      <div
        role="tablist"
        aria-label="Calendar view"
        style={{ display: 'flex', background: '#F1F0F8', borderRadius: 10, padding: 3, gap: 2 }}
      >
        {VIEW_OPTIONS.map(v => (
          <button
            key={v.value}
            type="button"
            role="tab"
            aria-selected={c.view === v.value}
            onClick={() => c.onSelectView(v.value)}
            style={{
              height: 34, padding: '0 16px', border: 0, borderRadius: 8,
              background: c.view === v.value ? '#FFFFFF' : 'transparent',
              color: c.view === v.value ? '#1F1B33' : '#6B6B7B',
              fontWeight: c.view === v.value ? 600 : 500,
              fontSize: 13.5,
              cursor: 'pointer',
              boxShadow: c.view === v.value ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Prev / Today / Next */}
      {c.showNav && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            aria-label="Previous"
            onClick={c.onPrev}
            style={{ width: 36, height: 36, border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#45435A', fontSize: 18 }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={c.onToday}
            style={{ height: 36, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', color: '#45435A', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={c.onNext}
            style={{ width: 36, height: 36, border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#45435A', fontSize: 18 }}
          >
            ›
          </button>
        </div>
      )}

      <span style={{ fontSize: 15, fontWeight: 600, color: '#1F1B33' }}>{c.label}</span>
    </div>
  );

  return (
    <>
      <PageHeader title="Calendar" actions={headerActions} />

      <main style={{ flexGrow: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {c.isLoading && (
          <p style={{ margin: 0, color: '#6B6B7B', fontSize: 14 }}>Loading your schedule…</p>
        )}
        {c.isError && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>
            Couldn&apos;t load your schedule. Please try again.
          </div>
        )}

        {!c.isLoading && !c.isError && (
          <>
            {c.view === 'today' && (
              <TodayView todayItems={c.todayItems} upcoming={c.upcoming} canManage={c.canManage} onManage={c.onManageSession} />
            )}
            {c.view === 'week' && (
              <WeekView columns={c.weekColumns} canManage={c.canManage} onManage={c.onManageSession} />
            )}
            {c.view === 'month' && (
              <MonthView weeks={c.monthWeeks} canManage={c.canManage} onManage={c.onManageSession} />
            )}
          </>
        )}
      </main>

      {c.dialogSession && (
        <CancelRescheduleDialog session={c.dialogSession} onClose={c.onCloseDialog} />
      )}
    </>
  );
};

export default CalendarPage;
