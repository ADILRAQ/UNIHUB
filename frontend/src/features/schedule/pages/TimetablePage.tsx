import useCourseManager from '../hooks/useCourseManager';
import CourseForm from '../components/CourseForm';
import TemplateManager from '../components/TemplateManager';
import EventManager from '../components/EventManager';

/**
 * Timetable management page (ADMIN + TEACHER, route-guarded). Left: the caller's
 * courses (admins can create/edit/delete; teachers see their own). Right: the
 * selected course's weekly timetable plus the events panel. All logic lives in
 * `useCourseManager` and the per-panel hooks.
 */
const TimetablePage = () => {
  const cm = useCourseManager();

  return (
    <section className="sched-manage">
      <div className="sched-manage__list">
        <div className="sched-panel__head">
          <h2 className="sched-panel__title">Courses</h2>
          {cm.canManage && (
            <button type="button" className="sched-btn sched-btn--primary" onClick={cm.onOpenCreate}>
              New course
            </button>
          )}
        </div>

        {cm.isLoading ? (
          <p className="sched-empty">Loading courses…</p>
        ) : cm.isError ? (
          <p className="sched-error">Couldn&apos;t load courses.</p>
        ) : cm.courses.length === 0 ? (
          <p className="sched-empty">No courses yet.</p>
        ) : (
          <ul className="sched-course-list">
            {cm.courses.map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  className={`sched-course${
                    cm.selectedCourseId === course.id ? ' sched-course--active' : ''
                  }`}
                  onClick={() => cm.onSelectCourse(course.id)}
                >
                  <strong>{course.name}</strong>
                  <span className="sched-course__meta">
                    {course.classGroupName} · {course.teacherName}
                  </span>
                </button>
                {cm.canManage && (
                  <div className="sched-course__actions">
                    <button
                      type="button"
                      className="sched-btn sched-btn--sm"
                      onClick={() => cm.onOpenEdit(course)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="sched-btn sched-btn--sm sched-btn--danger"
                      onClick={() => cm.onDelete(course)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sched-manage__detail">
        {cm.selectedCourse ? (
          <>
            <h2 className="sched-manage__course-name">{cm.selectedCourse.name}</h2>
            <TemplateManager courseId={cm.selectedCourse.id} />
          </>
        ) : (
          <p className="sched-empty">Select a course to manage its timetable.</p>
        )}

        <EventManager isAdmin={cm.canManage} manageableCourses={cm.courses} />
      </div>

      {cm.formOpen && (
        <CourseForm
          isEditing={cm.isEditing}
          form={cm.form}
          teachers={cm.teachers}
          classGroups={cm.classGroups}
          onCloseForm={cm.onCloseForm}
          onFormChange={cm.onFormChange}
          onSubmit={cm.onSubmit}
          isSaving={cm.isSaving}
          error={cm.error}
        />
      )}
    </section>
  );
};

export default TimetablePage;
