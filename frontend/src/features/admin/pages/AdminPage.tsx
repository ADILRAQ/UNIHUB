import useAdminPage from '../hooks/useAdminPage';
import UsersSection from '../components/UsersSection';
import AddUserSection from '../components/AddUserSection';
import ImportSection from '../components/ImportSection';
import ClassGroupsSection from '../components/ClassGroupsSection';
import PageHeader from '../../../components/layout/PageHeader';
import Tabs from '../../../components/ui/Tabs';

const AdminPage = () => {
  const { tabs, activeTab, onSelectTab } = useAdminPage();

  return (
    <>
      <PageHeader title="People" subtitle="Accounts, class groups and bulk onboarding" />
      <div className="page-body">
        <Tabs tabs={tabs} active={activeTab} onSelect={onSelectTab} label="People sections" />

        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'add-user' && <AddUserSection />}
        {activeTab === 'import' && <ImportSection />}
        {activeTab === 'class-groups' && <ClassGroupsSection />}
      </div>
    </>
  );
};

export default AdminPage;
