import { useState } from 'react';

/** The admin console's sections, used as tab keys. */
export type AdminTab = 'users' | 'add-user' | 'import' | 'class-groups';

export interface AdminTabDef {
  key: AdminTab;
  label: string;
}

export const ADMIN_TABS: AdminTabDef[] = [
  { key: 'users', label: 'Users' },
  { key: 'add-user', label: 'Add user' },
  { key: 'import', label: 'Bulk import' },
  { key: 'class-groups', label: 'Class groups' },
];

export interface UseAdminPage {
  tabs: AdminTabDef[];
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

/**
 * Logic for the admin console page: owns the active-tab state for the simple
 * sub-nav. Each section fetches and mutates its own data through its own logic
 * hook, so this page hook stays limited to navigation between sections.
 */
const useAdminPage = (): UseAdminPage => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  return {
    tabs: ADMIN_TABS,
    activeTab,
    onSelectTab: setActiveTab,
  };
};

export default useAdminPage;
