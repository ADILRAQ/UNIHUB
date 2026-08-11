/**
 * Logic hook for the teacher recap editor page (TEACHER / ADMIN only).
 * Fetches the current recap for pre-filling, fetches course resources and
 * assignments for the link pickers, owns form state, and handles save mutation.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { useToast } from '../../../components/ui/Toast';
import {
  getSessionRecap,
  updateSessionRecap,
  getCourseResourcesForRecap,
  getCourseAssignmentsForRecap,
} from '../services/recapService';
import type { SessionRecap, RecapResource, RecapAssignment, RecapUpdatePayload } from '../types';

interface UseTeacherRecapEditorPageReturn {
  isLoadingRecap: boolean;
  isLoadingResources: boolean;
  isLoadingAssignments: boolean;
  resources: RecapResource[];
  assignments: RecapAssignment[];
  recordingUrl: string;
  setRecordingUrl: (v: string) => void;
  notesHtml: string;
  setNotesHtml: (v: string) => void;
  selectedResourceIds: number[];
  toggleResource: (id: number) => void;
  selectedAssignmentIds: number[];
  toggleAssignment: (id: number) => void;
  isSaving: boolean;
  handleSubmit: () => void;
  sessionId: number;
  courseId: number;
}

const useTeacherRecapEditorPage = (): UseTeacherRecapEditorPageReturn => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const id = Number(sessionId);
  const courseId = Number(searchParams.get('courseId') ?? '0');

  // ── Fetch existing recap to pre-fill form ────────────────────────────────
  const { data: recap, isLoading: isLoadingRecap } = useGetData<
    SessionRecap,
    string | number,
    SessionRecap
  >({
    queryKey: ['recap', id],
    queryFn: () => getSessionRecap(id),
    transformFn: (d) => d,
    enabled: !isNaN(id) && id > 0,
  });

  // ── Fetch resource and assignment pickers ────────────────────────────────
  const { data: resources, isLoading: isLoadingResources } = useGetData<
    RecapResource[],
    string | number,
    RecapResource[]
  >({
    queryKey: ['course-recap-resources', courseId],
    queryFn: () => getCourseResourcesForRecap(courseId),
    transformFn: (d) => d,
    enabled: courseId > 0,
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useGetData<
    RecapAssignment[],
    string | number,
    RecapAssignment[]
  >({
    queryKey: ['course-recap-assignments', courseId],
    queryFn: () => getCourseAssignmentsForRecap(courseId),
    transformFn: (d) => d,
    enabled: courseId > 0,
  });

  // ── Form state ───────────────────────────────────────────────────────────
  const [recordingUrl, setRecordingUrl] = useState('');
  const [notesHtml, setNotesHtml] = useState('');
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<number[]>([]);

  // Sync form state once recap data arrives (pre-fill).
  useEffect(() => {
    if (recap) {
      setRecordingUrl(recap.recordingUrl ?? '');
      setNotesHtml(recap.notesHtml ?? '');
      setSelectedResourceIds(recap.linkedResources.map((r) => r.id));
      setSelectedAssignmentIds(recap.linkedAssignments.map((a) => a.id));
    }
  }, [recap]);

  const toggleResource = useCallback((resourceId: number) => {
    setSelectedResourceIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((i) => i !== resourceId)
        : [...prev, resourceId],
    );
  }, []);

  const toggleAssignment = useCallback((assignmentId: number) => {
    setSelectedAssignmentIds((prev) =>
      prev.includes(assignmentId)
        ? prev.filter((i) => i !== assignmentId)
        : [...prev, assignmentId],
    );
  }, []);

  // ── Save mutation ────────────────────────────────────────────────────────
  const { mutate: saveRecap, isPending: isSaving } = usePostData<
    string | number,
    RecapUpdatePayload,
    SessionRecap
  >({
    keys: ['recap', 'update', id],
    serviceFn: (payload) => updateSessionRecap(id, payload),
    onSuccessFn: () => {
      void queryClient.invalidateQueries({ queryKey: ['recap', id] });
      void queryClient.invalidateQueries({ queryKey: ['course-past-sessions', courseId] });
      toast.success('Recap saved!');
      navigate(`/sessions/${id}/recap?courseId=${courseId}`);
    },
    onErrorFn: () => {
      toast.error('Failed to save recap. Please try again.');
    },
  });

  const handleSubmit = useCallback(() => {
    saveRecap({
      recordingUrl: recordingUrl.trim() || undefined,
      notesHtml: notesHtml.trim() || undefined,
      linkedResourceIds: selectedResourceIds,
      linkedAssignmentIds: selectedAssignmentIds,
    });
  }, [saveRecap, recordingUrl, notesHtml, selectedResourceIds, selectedAssignmentIds]);

  return {
    isLoadingRecap,
    isLoadingResources,
    isLoadingAssignments,
    resources: resources ?? [],
    assignments: assignments ?? [],
    recordingUrl,
    setRecordingUrl,
    notesHtml,
    setNotesHtml,
    selectedResourceIds,
    toggleResource,
    selectedAssignmentIds,
    toggleAssignment,
    isSaving,
    handleSubmit,
    sessionId: id,
    courseId,
  };
};

export default useTeacherRecapEditorPage;
