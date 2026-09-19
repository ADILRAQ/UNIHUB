import useTeacherPage from '../hooks/useTeacherPage';
import TeacherCoursesSection from '../components/TeacherCoursesSection';
import TeacherStudentsSection from '../components/TeacherStudentsSection';
import PageHeader from '../../../components/layout/PageHeader';

const TeacherPage = () => {
  const { tabs, activeTab, onSelectTab } = useTeacherPage();

  return (
    <>
      <PageHeader title="Teacher Workspace" />
      <main style={{ flexGrow: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <nav style={{ display: 'flex', gap: 8, marginBottom: 28 }} aria-label="Teacher sections">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelectTab(tab.key)}
                style={{
                  height: 40, padding: '0 16px',
                  border: `1px solid ${active ? '#4A41C9' : '#E1DEF2'}`,
                  borderRadius: 9,
                  background: active ? '#EEEDFF' : '#FFFFFF',
                  color: active ? '#4A41C9' : '#45435A',
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === 'courses' && <TeacherCoursesSection />}
        {activeTab === 'students' && <TeacherStudentsSection />}
      </main>
    </>
  );
};

export default TeacherPage;
