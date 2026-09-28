/**
 * Academic years run September 1 – August 31 ("2026-2027").
 * Mirrors `PaymentService.academicYearOf` on the backend, which is the source of truth.
 */
const START_MONTH = 8; // September (0-based)

export const academicYearOf = (date: Date): string => {
  const start = date.getMonth() >= START_MONTH ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}-${start + 1}`;
};

/** Plans can be created for the current academic year and the next one only. */
export const plannableYears = (today: Date = new Date()): string[] => {
  const next = new Date(today);
  next.setFullYear(today.getFullYear() + 1);
  return [academicYearOf(today), academicYearOf(next)];
};
