import useCalendar from '../hooks/useCalendar';
import TodayView from '../components/TodayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import CancelRescheduleDialog from '../components/CancelRescheduleDialog';
import PageHeader from '../../../components/layout/PageHeader';
import Tabs from '../../../components/ui/Tabs';
import type { TabItem } from '../../../components/ui/Tabs';
import type { CalendarView } from '../types';

const VIEW_OPTIONS: TabItem<CalendarView>[] = [
  { key: 'today', label: 'Agenda' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

/**
 * Calendar page — artboard design.
 * Thin UI over useCalendar: view switcher pill, prev/next nav, and the view content.
 */
const CalendarPage = () => {
  const c = useCalendar();

  const headerActions = (
    <>
      {c.showNav && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" className="btn btn--icon btn--sm" aria-label="Previous" onClick={c.onPrev} style={{ fontSize: 18 }}>‹</button>
          <button type="button" className="btn btn--sm" onClick={c.onToday}>Today</button>
          <button type="button" className="btn btn--icon btn--sm" aria-label="Next" onClick={c.onNext} style={{ fontSize: 18 }}>›</button>
        </div>
      )}
      <Tabs tabs={VIEW_OPTIONS} active={c.view} onSelect={c.onSelectView} label="Calendar view" />
    </>
  );

  return (
    <>
      <PageHeader title="Calendar" subtitle={c.label} actions={headerActions} />

      <div className="page-body">
        {c.isLoading && <div className="skeleton" style={{ height: 320 }} />}
        {c.isError && (
          <div role="alert" className="alert">
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
      </div>

      {c.dialogSession && (
        <CancelRescheduleDialog session={c.dialogSession} onClose={c.onCloseDialog} />
      )}
    </>
  );
};

export default CalendarPage;
