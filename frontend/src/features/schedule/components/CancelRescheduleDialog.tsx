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
      className="sched-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel or reschedule session"
    >
      <div className="sched-modal__card">
        <header className="sched-modal__head">
          <h2 className="sched-modal__title">{session.title}</h2>
          <button
            type="button"
            className="sched-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <p className="sched-modal__sub">
          {formatDateLong(parseISODate(session.date))} ·{' '}
          {formatTimeRange(session.startTime, session.endTime)}
        </p>

        <div className="sched-modal__tabs">
          <button
            type="button"
            className={`sched-modal__tab${mode === 'cancel' ? ' sched-modal__tab--active' : ''}`}
            onClick={() => onSelectMode('cancel')}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`sched-modal__tab${
              mode === 'reschedule' ? ' sched-modal__tab--active' : ''
            }`}
            onClick={() => onSelectMode('reschedule')}
          >
            Reschedule
          </button>
        </div>

        <form className="sched-form" onSubmit={onSubmit}>
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

          <div className="sched-form__actions">
            <button
              type="submit"
              className={`sched-btn sched-btn--primary${
                mode === 'cancel' ? ' sched-btn--danger' : ''
              }`}
              disabled={isPending}
            >
              {isPending
                ? 'Saving…'
                : mode === 'cancel'
                  ? 'Cancel this session'
                  : 'Reschedule session'}
            </button>
            <button type="button" className="sched-btn" onClick={onClose} disabled={isPending}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelRescheduleDialog;
