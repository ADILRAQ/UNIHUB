import { useState } from 'react';
import type { CreatePeriodEntry } from '../types';

const EMPTY_ROW = (): { label: string; amount: string; dueDate: string } => ({
  label: '',
  amount: '',
  dueDate: '',
});

export interface UsePlanTab {
  academicYear: string;
  rows: { label: string; amount: string; dueDate: string }[];
  formError: string | null;
  setAcademicYear: (v: string) => void;
  updateRow: (index: number, field: 'label' | 'amount' | 'dueDate', value: string) => void;
  handleSubmit: () => void;
}

/**
 * All logic for the year-plan creation form in the admin payments tab.
 * Receives the submit callback via parameter so the component stays pure UI.
 */
const usePlanTab = (
  onCreatePlan: (data: { academicYear: string; periods: CreatePeriodEntry[] }) => void,
): UsePlanTab => {
  const [academicYear, setAcademicYear] = useState('');
  const [rows, setRows] = useState([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [formError, setFormError] = useState<string | null>(null);

  const updateRow = (index: number, field: 'label' | 'amount' | 'dueDate', value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!academicYear.trim()) {
      setFormError('Academic year is required.');
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
    onCreatePlan({
      academicYear: academicYear.trim(),
      periods: rows.map((row, i) => ({
        label: row.label.trim(),
        amount: Number(row.amount),
        dueDate: row.dueDate,
        periodOrder: i + 1,
      })),
    });
  };

  return { academicYear, rows, formError, setAcademicYear, updateRow, handleSubmit };
};

export default usePlanTab;
