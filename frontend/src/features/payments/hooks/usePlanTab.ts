import { useMemo, useState } from 'react';
import type { CreateYearPlanPayload, PaymentPeriodDto } from '../types';

type PlanRow = { label: string; amount: string; dueDate: string };

const EMPTY_ROW = (): PlanRow => ({
  label: '',
  amount: '',
  dueDate: '',
});

const EMPTY_ROWS = (): PlanRow[] => [EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()];

/** One class group's plan inside an academic year. */
export interface GroupPlan {
  classGroupId: number;
  classGroupName: string;
  periods: PaymentPeriodDto[];
}

/** An academic year with its per-group plans, in backend order. */
export interface YearGroupPlans {
  year: string;
  groups: GroupPlan[];
}

export interface UsePlanTab {
  groupedPlans: YearGroupPlans[];
  academicYear: string;
  classGroupId: string;
  rows: PlanRow[];
  formError: string | null;
  setAcademicYear: (v: string) => void;
  setClassGroupId: (v: string) => void;
  updateRow: (index: number, field: 'label' | 'amount' | 'dueDate', value: string) => void;
  handleSubmit: () => void;
}

/**
 * All logic for the payment-plan tab: groups the existing plans by year then
 * class group, and owns the per-group plan creation form. Receives the submit
 * callback via parameter so the component stays pure UI.
 */
const usePlanTab = (
  yearPlans: Record<string, PaymentPeriodDto[]>,
  onCreatePlan: (data: CreateYearPlanPayload, onCreated?: () => void) => void,
): UsePlanTab => {
  const [academicYear, setAcademicYear] = useState('');
  const [classGroupId, setClassGroupId] = useState('');
  const [rows, setRows] = useState<PlanRow[]>(EMPTY_ROWS);
  const [formError, setFormError] = useState<string | null>(null);

  // Backend already sorts by year desc, group name, period order — preserve that order.
  const groupedPlans = useMemo<YearGroupPlans[]>(
    () =>
      Object.entries(yearPlans).map(([year, periods]) => {
        const groups: GroupPlan[] = [];
        for (const p of periods) {
          let group = groups.find((g) => g.classGroupId === p.classGroupId);
          if (!group) {
            group = { classGroupId: p.classGroupId, classGroupName: p.classGroupName, periods: [] };
            groups.push(group);
          }
          group.periods.push(p);
        }
        return { year, groups };
      }),
    [yearPlans],
  );

  const updateRow = (index: number, field: 'label' | 'amount' | 'dueDate', value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const resetForm = () => {
    setAcademicYear('');
    setClassGroupId('');
    setRows(EMPTY_ROWS());
    setFormError(null);
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!academicYear.trim()) {
      setFormError('Academic year is required.');
      return;
    }
    if (!classGroupId) {
      setFormError('Class group is required.');
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.label.trim() || !row.amount || !row.dueDate) {
        setFormError(`Row ${i + 1}: all fields are required.`);
        return;
      }
      if (Number(row.amount) <= 0) {
        setFormError(`Row ${i + 1}: amount must be greater than 0.`);
        return;
      }
    }
    if (rows[0].dueDate >= rows[1].dueDate || rows[1].dueDate >= rows[2].dueDate) {
      setFormError('Due dates must be in order: 1 < 2 < 3.');
      return;
    }
    onCreatePlan(
      {
        academicYear: academicYear.trim(),
        classGroupId: Number(classGroupId),
        periods: rows.map((row, i) => ({
          label: row.label.trim(),
          amount: Number(row.amount),
          dueDate: row.dueDate,
          periodOrder: i + 1,
        })),
      },
      resetForm,
    );
  };

  return {
    groupedPlans,
    academicYear,
    classGroupId,
    rows,
    formError,
    setAcademicYear,
    setClassGroupId,
    updateRow,
    handleSubmit,
  };
};

export default usePlanTab;
