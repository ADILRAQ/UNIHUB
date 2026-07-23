import useTemplateManager from '../hooks/useTemplateManager';
import { DAY_OF_WEEK_OPTIONS, formatTimeRange } from '../calendar';

interface TemplateManagerProps {
  courseId: number;
}

const DAY_LABEL: Record<string, string> = Object.fromEntries(
  DAY_OF_WEEK_OPTIONS.map((o) => [o.value, o.label]),
);

/**
 * Weekly-template panel for a selected course (admin or owning teacher). Lists the
 * course's templates and offers an inline add/edit form; creating or editing a
 * template regenerates its sessions on the server. All logic lives in
 * `useTemplateManager`.
 */
const TemplateManager = ({ courseId }: TemplateManagerProps) => {
  const t = useTemplateManager(courseId);

  return (
    <div className="sched-panel">
      <div className="sched-panel__head">
        <h3 className="sched-panel__title">Weekly timetable</h3>
        {!t.formOpen && (
          <button type="button" className="sched-btn sched-btn--primary" onClick={t.onOpenCreate}>
            Add weekly slot
          </button>
        )}
      </div>

      {t.formOpen && (
        <form className="sched-form sched-form--inline" onSubmit={t.onSubmit}>
          <div className="sched-field-row">
            <label className="sched-field">
              <span>Day</span>
              <select
                value={t.form.dayOfWeek}
                onChange={(e) => t.onFormChange({ dayOfWeek: e.target.value as typeof t.form.dayOfWeek })}
                disabled={t.isSaving}
              >
                {DAY_OF_WEEK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="sched-field">
              <span>Start</span>
              <input
                type="time"
                value={t.form.startTime}
                onChange={(e) => t.onFormChange({ startTime: e.target.value })}
                disabled={t.isSaving}
                required
              />
            </label>
            <label className="sched-field">
              <span>End</span>
              <input
                type="time"
                value={t.form.endTime}
                onChange={(e) => t.onFormChange({ endTime: e.target.value })}
                disabled={t.isSaving}
                required
              />
            </label>
          </div>
          <div className="sched-field-row">
            <label className="sched-field">
              <span>Room (optional)</span>
              <input
                type="text"
                value={t.form.room}
                onChange={(e) => t.onFormChange({ room: e.target.value })}
                disabled={t.isSaving}
              />
            </label>
            <label className="sched-field">
              <span>From</span>
              <input
                type="date"
                value={t.form.startDate}
                onChange={(e) => t.onFormChange({ startDate: e.target.value })}
                disabled={t.isSaving}
                required
              />
            </label>
            <label className="sched-field">
              <span>Until</span>
              <input
                type="date"
                value={t.form.endDate}
                onChange={(e) => t.onFormChange({ endDate: e.target.value })}
                disabled={t.isSaving}
                required
              />
            </label>
          </div>
          <label className="sched-check">
            <input
              type="checkbox"
              checked={t.form.active}
              onChange={(e) => t.onFormChange({ active: e.target.checked })}
              disabled={t.isSaving}
            />
            <span>Active (generates sessions)</span>
          </label>
          {t.error && <p className="sched-error">{t.error}</p>}
          <div className="sched-form__actions">
            <button type="submit" className="sched-btn sched-btn--primary" disabled={t.isSaving}>
              {t.isSaving ? 'Saving…' : t.isEditing ? 'Save & regenerate' : 'Add & generate'}
            </button>
            <button type="button" className="sched-btn" onClick={t.onCloseForm} disabled={t.isSaving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {t.isLoading ? (
        <p className="sched-empty">Loading timetable…</p>
      ) : t.isError ? (
        <p className="sched-error">Couldn&apos;t load the timetable.</p>
      ) : t.templates.length === 0 ? (
        <p className="sched-empty">No weekly slots yet.</p>
      ) : (
        <ul className="sched-tpl-list">
          {t.templates.map((tpl) => (
            <li key={tpl.id} className={`sched-tpl${tpl.active ? '' : ' sched-tpl--inactive'}`}>
              <div className="sched-tpl__main">
                <strong>{DAY_LABEL[tpl.dayOfWeek] ?? tpl.dayOfWeek}</strong>{' '}
                {formatTimeRange(tpl.startTime, tpl.endTime)}
                {tpl.room ? ` · Room ${tpl.room}` : ''}
                <span className="sched-tpl__range">
                  {tpl.startDate} → {tpl.endDate}
                  {tpl.active ? '' : ' · inactive'}
                </span>
              </div>
              <div className="sched-tpl__actions">
                <button type="button" className="sched-btn sched-btn--sm" onClick={() => t.onOpenEdit(tpl)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="sched-btn sched-btn--sm"
                  onClick={() => t.onToggleActive(tpl)}
                >
                  {tpl.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  className="sched-btn sched-btn--sm sched-btn--danger"
                  onClick={() => t.onDelete(tpl)}
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

export default TemplateManager;
