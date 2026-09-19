import useCourseManager from '../hooks/useCourseManager';
import CourseForm from '../components/CourseForm';
import TemplateManager from '../components/TemplateManager';
import EventManager from '../components/EventManager';
import PageHeader from '../../../components/layout/PageHeader';

const TimetablePage = () => {
  const cm = useCourseManager();

  return (
    <>
      <PageHeader title="Timetable" />
      <main style={{ flexGrow: 1, display: 'flex', overflowY: 'hidden', gap: 0 }}>
        {/* Course list panel */}
        <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #E8E6F5', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 14px', gap: 8 }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1F1B33' }}>Courses</span>
            {cm.canManage && (
              <button
                type="button"
                onClick={cm.onOpenCreate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', border: 0, borderRadius: 8, background: '#5A4FE0', color: '#FFFFFF', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5v13M5.5 12h13"/></svg>
                New course
              </button>
            )}
          </div>

          {cm.isLoading && <p style={{ margin: '0 20px', fontSize: 13.5, color: '#6B6B7B' }}>Loading courses…</p>}
          {cm.isError && <p style={{ margin: '0 20px', fontSize: 13.5, color: '#B91C1C' }}>Couldn&apos;t load courses.</p>}
          {!cm.isLoading && !cm.isError && cm.courses.length === 0 && (
            <p style={{ margin: '0 20px', fontSize: 13.5, color: '#6B6B7B' }}>No courses yet.</p>
          )}

          <ul style={{ listStyle: 'none', margin: 0, padding: '0 12px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cm.courses.map((course) => {
              const isActive = cm.selectedCourseId === course.id;
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => cm.onSelectCourse(course.id)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
                      padding: '10px 12px', borderRadius: 9,
                      background: isActive ? '#EEEDFF' : 'transparent',
                      color: isActive ? '#4A41C9' : '#45435A',
                      display: 'flex', flexDirection: 'column', gap: 2,
                    }}
                  >
                    <strong style={{ fontSize: 13.5, fontWeight: 600 }}>{course.name}</strong>
                    <span style={{ fontSize: 12, color: isActive ? '#6C63FF' : '#8D8B9C' }}>{course.classGroupName} · {course.teacherName}</span>
                  </button>
                  {cm.canManage && (
                    <div style={{ display: 'flex', gap: 4, padding: '2px 12px 6px' }}>
                      <button type="button" onClick={() => cm.onOpenEdit(course)} style={{ height: 28, padding: '0 10px', border: '1px solid #E1DEF2', borderRadius: 7, background: '#FFFFFF', color: '#45435A', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      <button type="button" onClick={() => cm.onDelete(course)} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 7, background: '#FFE8E8', color: '#B02F2F', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail panel */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {cm.selectedCourse ? (
            <>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.01em' }}>{cm.selectedCourse.name}</h2>
              <TemplateManager courseId={cm.selectedCourse.id} />
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: '#6B6B7B' }}>Select a course to manage its timetable.</p>
          )}
          <EventManager isAdmin={cm.canManage} manageableCourses={cm.courses} />
        </div>
      </main>

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
