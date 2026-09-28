/** Dashboard-feature-local types. */

export type KpiIcon = 'calendar' | 'assignment' | 'megaphone' | 'alert' | 'people';

export interface KpiDef {
  key: string;
  icon: KpiIcon;
  label: string;
  /** null while loading or unavailable. */
  value: number | null;
  /** Where clicking the tile takes you. */
  to: string;
  /** Needs attention: the number turns orange. */
  alert?: boolean;
}
