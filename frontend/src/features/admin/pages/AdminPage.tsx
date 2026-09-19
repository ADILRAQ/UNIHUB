import useAdminPage from '../hooks/useAdminPage';
import UsersSection from '../components/UsersSection';
import AddUserSection from '../components/AddUserSection';
import ImportSection from '../components/ImportSection';
import ClassGroupsSection from '../components/ClassGroupsSection';
import PageHeader from '../../../components/layout/PageHeader';

const AdminPage = () => {
  const { tabs, activeTab, onSelectTab } = useAdminPage();

  return (
    <>
      <PageHeader title="Admin Console" />
      <main style={{ flexGrow: 1, padding: '28px 32px', overflowY: 'auto' }}>
        <nav style={{ display: 'flex', gap: 8, marginBottom: 28 }} aria-label="Admin sections">
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

        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'add-user' && <AddUserSection />}
        {activeTab === 'import' && <ImportSection />}
        {activeTab === 'class-groups' && <ClassGroupsSection />}
      </main>
    </>
  );
};

export default AdminPage;
