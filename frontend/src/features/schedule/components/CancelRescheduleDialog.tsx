import useCancelReschedule from '../hooks/useCancelReschedule';
import { formatTimeRange, parseISODate, formatDateLong } from '../calendar';
import type { ScheduleItem } from '../types';

interface CancelRescheduleDialogProps {
  session: ScheduleItem;
  onClose: () => void;
}

/**
 * Modal for cancelling or rescheduling a session. All logic (mode toggle, form
 * state, mutations, error surfacing, refetch) lives in `useCancelReschedule`;
 * this component only renders. Backend guards (400 normal-class-day, 409 occupied
 * slot) surface inline.
 */
const CancelRescheduleDialog = ({ session, onClose }: CancelRescheduleDialogProps) => {
  const { mode, onSelectMode, note, onNoteChange, form, onFormChange, error, isPending, onSubmit } =
    useCancelReschedule(session, onClose);

  return (
    <div
      className="sched-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel or reschedule session"
    >
      <div className="sched-dialog">
        <header className="sched-dialog__header">
          <div>
            <h2 className="sched-dialog__title">{session.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>
              {formatDateLong(parseISODate(session.date))} &middot;{' '}
              {formatTimeRange(session.startTime, session.endTime)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className="sched-dialog__body">
            <div className="tabs">
              <button
                type="button"
                className={`tab${mode === 'cancel' ? ' tab--active' : ''}`}
                onClick={() => onSelectMode('cancel')}
              >
                Cancel session
              </button>
              <button
                type="button"
                className={`tab${mode === 'reschedule' ? ' tab--active' : ''}`}
                onClick={() => onSelectMode('reschedule')}
              >
                Reschedule
              </button>
            </div>

            {mode === 'reschedule' && (
              <>
                <label className="sched-field">
                  <span>New date (an off day — a make-up class)</span>
                  <input
                    type="date"
                    value={form.newDate}
                    onChange={(event) => onFormChange({ newDate: event.target.value })}
                    disabled={isPending}
                    required
                  />
                </label>
                <div className="sched-field-row">
                  <label className="sched-field">
                    <span>Start</span>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(event) => onFormChange({ startTime: event.target.value })}
                      disabled={isPending}
                      required
                    />
                  </label>
                  <label className="sched-field">
                    <span>End</span>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(event) => onFormChange({ endTime: event.target.value })}
                      disabled={isPending}
                      required
                    />
                  </label>
                </div>
                <label className="sched-field">
                  <span>Room (optional)</span>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(event) => onFormChange({ room: event.target.value })}
                    disabled={isPending}
                  />
                </label>
              </>
            )}

            <label className="sched-field">
              <span>Note (optional)</span>
              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                disabled={isPending}
                rows={2}
              />
            </label>

            {error && <p className="sched-error">{error}</p>}
          </div>

          <footer className="sched-dialog__footer">
            <button type="button" className="btn" onClick={onClose} disabled={isPending}>
              Close
            </button>
            <button
              type="submit"
              className={`btn ${mode === 'cancel' ? 'btn--danger' : 'btn--primary'}`}
              disabled={isPending}
            >
              {isPending
                ? 'Saving…'
                : mode === 'cancel'
                  ? 'Cancel this session'
                  : 'Reschedule session'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CancelRescheduleDialog;
