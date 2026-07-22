import type { Role } from './types';

/**
 * The landing route for each role after login / when redirected away from a
 * section they may not access. For this story every role shares the dashboard;
 * as feature epics land, roles will diverge to their own home sections, at
 * which point each branch below gets its own path.
 */
export const homePathForRole = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
    case 'TEACHER':
    case 'STUDENT':
    default:
      return '/';
  }
};
