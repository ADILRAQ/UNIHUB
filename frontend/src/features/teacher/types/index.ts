/** Teacher-feature-local types. */

export type TeacherTab = 'courses' | 'students';

export interface TeacherTabDef {
  key: TeacherTab;
  label: string;
}

export const TEACHER_TABS: TeacherTabDef[] = [
  { key: 'courses', label: 'My courses' },
  { key: 'students', label: 'My students' },
];
