import useTeacherPage from '../hooks/useTeacherPage';
import TeacherCoursesSection from '../components/TeacherCoursesSection';
import TeacherStudentsSection from '../components/TeacherStudentsSection';

/**
 * Teacher workspace page (TEACHER and ADMIN roles, guarded by `RequireRole` in
 * the router). A simple tab layout switches between the courses and students
 * sections. All logic lives in the section hooks; this page only owns tab
 * navigation via `useTeacherPage`.
 */
const TeacherPage = () => {
  const { tabs, activeTab, onSelectTab } = useTeacherPage();

  return (
    <section className="teacher-console">
      <h1>Teacher workspace</h1>

      <nav className="admin-tabs" aria-label="Teacher sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab${activeTab === tab.key ? ' admin-tab--active' : ''}`}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            onClick={() => onSelectTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'courses' && <TeacherCoursesSection />}
      {activeTab === 'students' && <TeacherStudentsSection />}
    </section>
  );
};

export default TeacherPage;
