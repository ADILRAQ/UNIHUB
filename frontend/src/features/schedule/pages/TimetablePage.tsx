import useCourseManager from '../hooks/useCourseManager';
import CourseForm from '../components/CourseForm';
import TemplateManager from '../components/TemplateManager';
import EventManager from '../components/EventManager';
import PageHeader from '../../../components/layout/PageHeader';
import { courseColorVars } from '../../../utils/courseColor';

const TimetablePage = () => {
  const cm = useCourseManager();

  return (
    <>
      <PageHeader
        title="Timetable"
        subtitle="Courses, weekly slots, exams and deadlines"
        actions={cm.canManage ? <button type="button" className="btn btn--primary" onClick={cm.onOpenCreate}>New course</button> : undefined}
      />
      <div style={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
        {/* Course list */}
        <nav aria-label="Courses" style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div className="sidebar-section-label" style={{ paddingLeft: 24 }}>Courses</div>

          {cm.isLoading && <div className="skeleton" style={{ height: 160, margin: '0 16px' }} />}
          {cm.isError && <p className="alert" style={{ margin: '0 16px' }}>Couldn&apos;t load courses.</p>}
          {!cm.isLoading && !cm.isError && cm.courses.length === 0 && (
            <p style={{ margin: '0 24px', fontSize: 13, color: 'var(--ink-500)' }}>No courses yet.</p>
          )}

          <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cm.courses.map((course) => {
              const isActive = cm.selectedCourseId === course.id;
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => cm.onSelectCourse(course.id)}
                    className={`tt-course${isActive ? ' tt-course--active' : ''}`}
                    style={courseColorVars(course.id)}
                  >
                    <span className="tt-course__avatar">{course.name.charAt(0).toUpperCase()}</span>
                    <span className="tt-course__text">
                      <span className="tt-course__name">{course.name}</span>
                      <span className="tt-course__meta">{course.classGroupName} · {course.teacherName}</span>
                    </span>
                    <svg className="tt-course__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Detail */}
        <div className="page-body" style={{ flexGrow: 1, overflowY: 'auto' }}>
          {cm.selectedCourse ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 className="section-title">{cm.selectedCourse.name}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>
                    {cm.selectedCourse.classGroupName} · {cm.selectedCourse.teacherName}
                  </p>
                </div>
                {cm.canManage && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn--sm" onClick={() => cm.selectedCourse && cm.onOpenEdit(cm.selectedCourse)}>Edit course</button>
                    <button type="button" className="btn btn--sm btn--danger" onClick={() => cm.selectedCourse && cm.onDelete(cm.selectedCourse)}>Delete</button>
                  </div>
                )}
              </div>
              <TemplateManager courseId={cm.selectedCourse.id} />
            </>
          ) : (
            <div className="empty-state">
              <h2 className="empty-state__title">No courses yet</h2>
              <p className="empty-state__body">
                {cm.canManage ? 'Create a course with New course, then add its weekly slots here.' : 'Courses you teach will appear here.'}
              </p>
            </div>
          )}
          <EventManager isAdmin={cm.canManage} manageableCourses={cm.courses} />
        </div>
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
    </>
  );
};

export default TimetablePage;
