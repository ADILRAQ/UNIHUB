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

          <ul style={{ listStyle: 'none', margin: 0, padding: '0 12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cm.courses.map((course) => {
              const isActive = cm.selectedCourseId === course.id;
              const initial = course.name.charAt(0).toUpperCase();
              return (
                <li key={course.id}>
                  <div
                    style={{
                      borderRadius: 12,
                      border: isActive ? '1.5px solid #6C63FF' : '1px solid #E8E6F5',
                      background: isActive ? '#F4F3FF' : '#FFFFFF',
                      boxShadow: isActive ? '0 2px 12px rgba(108,99,255,0.12)' : '0 1px 3px rgba(108,99,255,0.06)',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.15s, border-color 0.15s',
                    }}
                  >
                    {/* Clickable area */}
                    <button
                      type="button"
                      onClick={() => cm.onSelectCourse(course.id)}
                      style={{
                        width: '100%', textAlign: 'left', cursor: 'pointer',
                        border: 0, background: 'transparent',
                        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      {/* Avatar */}
                      <span style={{
                        flexShrink: 0, width: 34, height: 34, borderRadius: 9,
                        background: isActive ? '#6C63FF' : '#EEEDFF',
                        color: isActive ? '#FFFFFF' : '#4A41C9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                      }}>{initial}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: isActive ? '#3730A3' : '#1F1B33', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {course.name}
                        </span>
                        <span style={{ display: 'block', fontSize: 11.5, color: isActive ? '#6C63FF' : '#8D8B9C', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {course.classGroupName} · {course.teacherName}
                        </span>
                      </span>
                      {/* Chevron */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#6C63FF' : '#C4C2D4'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="m9 6 6 6-6 6"/>
                      </svg>
                    </button>

                    {/* Edit / Delete row */}
                    {cm.canManage && (
                      <div style={{ display: 'flex', gap: 6, padding: '0 12px 10px', borderTop: '1px solid', borderTopColor: isActive ? '#DDD9FF' : '#F0EEF8' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); cm.onOpenEdit(course); }}
                          style={{ flex: 1, height: 28, border: '1px solid #E1DEF2', borderRadius: 7, background: '#FFFFFF', color: '#45435A', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
                        >Edit</button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); cm.onDelete(course); }}
                          style={{ flex: 1, height: 28, border: 0, borderRadius: 7, background: '#FFE8E8', color: '#B02F2F', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
                        >Delete</button>
                      </div>
                    )}
                  </div>
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
