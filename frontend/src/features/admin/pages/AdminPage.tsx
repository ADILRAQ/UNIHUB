import useAdminPage from '../hooks/useAdminPage';
import UsersSection from '../components/UsersSection';
import AddUserSection from '../components/AddUserSection';
import ImportSection from '../components/ImportSection';
import ClassGroupsSection from '../components/ClassGroupsSection';

/**
 * Admin management console (ADMIN-only, guarded by `RequireRole` in the router).
 * A simple tab layout switches between the user list, single-user create, CSV
 * bulk import, and class-group management sections. All logic lives in the
 * section hooks; this page only owns tab navigation via `useAdminPage`.
 */
const AdminPage = () => {
  const { tabs, activeTab, onSelectTab } = useAdminPage();

  return (
    <section className="admin-console">
      <h1>Admin console</h1>

      <nav className="admin-tabs" aria-label="Admin sections">
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

      {activeTab === 'users' && <UsersSection />}
      {activeTab === 'add-user' && <AddUserSection />}
      {activeTab === 'import' && <ImportSection />}
      {activeTab === 'class-groups' && <ClassGroupsSection />}
    </section>
  );
};

export default AdminPage;
