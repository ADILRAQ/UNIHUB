import { useState } from 'react';
import { TEACHER_TABS } from '../types';
import type { TeacherTab, TeacherTabDef } from '../types';

export interface UseTeacherPage {
  tabs: TeacherTabDef[];
  activeTab: TeacherTab;
  onSelectTab: (tab: TeacherTab) => void;
}

/**
 * Logic for the teacher workspace page: owns the active-tab state for the
 * sub-nav. Each section manages its own data through its own logic hook, so
 * this hook stays limited to tab navigation.
 */
const useTeacherPage = (): UseTeacherPage => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('courses');

  return {
    tabs: TEACHER_TABS,
    activeTab,
    onSelectTab: setActiveTab,
  };
};

export default useTeacherPage;
