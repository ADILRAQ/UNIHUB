/** Dashboard-feature-local types. */

export type KpiIcon = 'calendar' | 'assignment' | 'megaphone' | 'alert' | 'people';

export interface KpiDef {
  key: string;
  icon: KpiIcon;
  label: string;
  /** null while loading; 'error' when it couldn't be loaded. */
  value: number | null | 'error';
  /** Where clicking the tile takes you. */
  to: string;
  /** Needs attention: the number turns orange. */
  alert?: boolean;
}
