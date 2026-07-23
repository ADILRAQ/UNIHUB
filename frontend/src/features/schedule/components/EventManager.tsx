import useEventManager from '../hooks/useEventManager';
import { formatDateLong, formatTimeRange, parseISODate } from '../calendar';
import type { Course, EventType } from '../types';

interface EventManagerProps {
  isAdmin: boolean;
  manageableCourses: Course[];
}

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'EXAM', label: 'Exam' },
  { value: 'DEADLINE', label: 'Deadline' },
  { value: 'EVENT', label: 'Event' },
];

/**
 * One-off events panel (exams / deadlines / events) for this year. Admins may
 * create department-wide (course-less) events; teachers must attach an event to
 * one of their own courses. All logic lives in `useEventManager`; every server
 * text field is rendered as plain text.
 */
const EventManager = ({ isAdmin, manageableCourses }: EventManagerProps) => {
  const e = useEventManager(isAdmin, manageableCourses);

  return (
    <div className="sched-panel">
      <div className="sched-panel__head">
        <h3 className="sched-panel__title">Exams, deadlines & events</h3>
        {!e.formOpen && (
          <button type="button" className="sched-btn sched-btn--primary" onClick={e.onOpenCreate}>
            Add event
          </button>
        )}
      </div>

      {e.formOpen && (
        <form className="sched-form sched-form--inline" onSubmit={e.onSubmit}>
          <label className="sched-field">
            <span>Title</span>
            <input
              type="text"
              value={e.form.title}
              onChange={(ev) => e.onFormChange({ title: ev.target.value })}
              disabled={e.isSaving}
              required
            />
          </label>
          <div className="sched-field-row">
            <label className="sched-field">
              <span>Type</span>
              <select
                value={e.form.type}
                onChange={(ev) => e.onFormChange({ type: ev.target.value as EventType })}
                disabled={e.isSaving}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="sched-field">
              <span>Date</span>
              <input
                type="date"
                value={e.form.eventDate}
                onChange={(ev) => e.onFormChange({ eventDate: ev.target.value })}
                disabled={e.isSaving}
                required
              />
            </label>
          </div>
          <div className="sched-field-row">
            <label className="sched-field">
              <span>Start (optional)</span>
              <input
                type="time"
                value={e.form.startTime}
                onChange={(ev) => e.onFormChange({ startTime: ev.target.value })}
                disabled={e.isSaving}
              />
            </label>
            <label className="sched-field">
              <span>End (optional)</span>
              <input
                type="time"
                value={e.form.endTime}
                onChange={(ev) => e.onFormChange({ endTime: ev.target.value })}
                disabled={e.isSaving}
              />
            </label>
          </div>
          <label className="sched-field">
            <span>Course {isAdmin ? '(optional — empty = department-wide)' : ''}</span>
            <select
              value={e.form.courseId}
              onChange={(ev) => e.onFormChange({ courseId: ev.target.value })}
              disabled={e.isSaving || e.isEditing}
            >
              <option value="">{isAdmin ? 'Department-wide' : 'Select a course…'}</option>
              {manageableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sched-field">
            <span>Description (optional)</span>
            <textarea
              value={e.form.description}
              onChange={(ev) => e.onFormChange({ description: ev.target.value })}
              disabled={e.isSaving}
              rows={2}
            />
          </label>
          {e.error && <p className="sched-error">{e.error}</p>}
          <div className="sched-form__actions">
            <button type="submit" className="sched-btn sched-btn--primary" disabled={e.isSaving}>
              {e.isSaving ? 'Saving…' : e.isEditing ? 'Save changes' : 'Add event'}
            </button>
            <button type="button" className="sched-btn" onClick={e.onCloseForm} disabled={e.isSaving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {e.isLoading ? (
        <p className="sched-empty">Loading events…</p>
      ) : e.isError ? (
        <p className="sched-error">Couldn&apos;t load events.</p>
      ) : e.events.length === 0 ? (
        <p className="sched-empty">No events this year.</p>
      ) : (
        <ul className="sched-tpl-list">
          {e.events.map((ev) => (
            <li key={ev.id} className="sched-tpl">
              <div className="sched-tpl__main">
                <span className={`sched-badge sched-badge--${ev.type.toLowerCase()}`}>{ev.type}</span>{' '}
                <strong>{ev.title}</strong>
                <span className="sched-tpl__range">
                  {formatDateLong(parseISODate(ev.eventDate))} ·{' '}
                  {formatTimeRange(ev.startTime, ev.endTime)}
                  {ev.courseName ? ` · ${ev.courseName}` : ' · department-wide'}
                </span>
              </div>
              <div className="sched-tpl__actions">
                <button type="button" className="sched-btn sched-btn--sm" onClick={() => e.onOpenEdit(ev)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="sched-btn sched-btn--sm sched-btn--danger"
                  onClick={() => e.onDelete(ev)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventManager;
