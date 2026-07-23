import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { cancelSession, rescheduleSession } from '../services/sessionService';
import { SCHEDULE_KEY } from './useSchedule';
import { formatTime, toApiTime } from '../calendar';
import type { ScheduleItem, Session } from '../types';

/** Which action the cancel/reschedule dialog is performing. */
export type ManageMode = 'cancel' | 'reschedule';

export interface RescheduleForm {
  newDate: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface UseCancelReschedule {
  mode: ManageMode;
  onSelectMode: (mode: ManageMode) => void;
  note: string;
  onNoteChange: (value: string) => void;
  form: RescheduleForm;
  onFormChange: (patch: Partial<RescheduleForm>) => void;
  error: string | null;
  isPending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * Logic for the cancel/reschedule dialog. Owns the mode toggle, the note and
 * reschedule-form state (pre-filled from the session), and the two mutations via
 * the generic `usePostData`. Backend guard messages — 400 "can't reschedule onto
 * a normal class day" and 409 "slot occupied" — are surfaced inline via
 * `apiErrorMessage`. Every success invalidates the schedule feed and calls
 * `onDone` so the calendar refetches and the dialog closes.
 */
const useCancelReschedule = (
  session: ScheduleItem,
  onDone: () => void,
): UseCancelReschedule => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ManageMode>('cancel');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RescheduleForm>({
    newDate: session.date,
    startTime: formatTime(session.startTime),
    endTime: formatTime(session.endTime),
    room: session.room ?? '',
  });

  const invalidateSchedule = () =>
    queryClient.invalidateQueries({ queryKey: [...SCHEDULE_KEY] });

  const onSuccess = () => {
    void invalidateSchedule();
    onDone();
  };

  const cancelMutation = usePostData<string, { id: number; note?: string }, Session>({
    keys: ['schedule', 'session', 'cancel'],
    serviceFn: cancelSession,
    onSuccessFn: onSuccess,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not cancel the session.')),
  });

  const rescheduleMutation = usePostData<
    string,
    { id: number; newDate: string; startTime: string; endTime: string; room?: string; note?: string },
    Session
  >({
    keys: ['schedule', 'session', 'reschedule'],
    serviceFn: rescheduleSession,
    onSuccessFn: onSuccess,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not reschedule the session.')),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === 'cancel') {
      cancelMutation.mutate({ id: session.id, note: note.trim() || undefined });
      return;
    }

    if (!form.newDate || !form.startTime || !form.endTime) {
      setError('Pick a new date, start time and end time.');
      return;
    }
    if (form.startTime >= form.endTime) {
      setError('End time must be after the start time.');
      return;
    }

    rescheduleMutation.mutate({
      id: session.id,
      newDate: form.newDate,
      startTime: toApiTime(form.startTime),
      endTime: toApiTime(form.endTime),
      room: form.room.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return {
    mode,
    onSelectMode: (next) => {
      setError(null);
      setMode(next);
    },
    note,
    onNoteChange: setNote,
    form,
    onFormChange: (patch) => setForm((current) => ({ ...current, ...patch })),
    error,
    isPending: cancelMutation.isPending || rescheduleMutation.isPending,
    onSubmit,
  };
};

export default useCancelReschedule;
