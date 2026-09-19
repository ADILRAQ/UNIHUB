/**
 * Logic hook for the Assignments tab of CoursePage.
 * Handles listing, CRUD (teacher/admin), student submission, and submission
 * expansion (teacher view).
 */
import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import * as assignmentService from '../services/assignmentService';
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmissionDto,
  SubmissionStatusDto,
} from '../types';
import type { Role } from '../../auth/types';

interface UseCourseAssignmentsReturn {
  assignments: AssignmentDto[];
  isLoading: boolean;
  isError: boolean;
  /* TEACHER / ADMIN mutations */
  createAssignment: (data: CreateAssignmentRequest) => void;
  isCreating: boolean;
  updateAssignment: (id: number, data: UpdateAssignmentRequest) => void;
  deleteAssignment: (id: number) => void;
  /* STUDENT */
  submitAssignment: (assignmentId: number, file: File) => void;
  submittingAssignmentId: number | null;
  /** Map of assignmentId → fetched submission (null means 404/error). */
  mySubmissionMap: Record<number, SubmissionDto | null>;
  fetchMySubmission: (assignmentId: number) => Promise<void>;
  /* Submission expansion (TEACHER / ADMIN) */
  expandedSubmissions: Set<number>;
  submissionsMap: Record<number, SubmissionStatusDto[]>;
  fetchSubmissions: (assignmentId: number) => void;
  toggleSubmissions: (assignmentId: number) => void;
  downloadSubmission: (submissionId: number, filename: string) => Promise<void>;
}

const useCourseAssignments = (
  courseId: number,
  role: Role,
): UseCourseAssignmentsReturn => {
  const queryClient = useQueryClient();
  const assignmentsKey = ['assignments', courseId] as const;

  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(
    new Set(),
  );
  const [submissionsMap, setSubmissionsMap] = useState<
    Record<number, SubmissionStatusDto[]>
  >({});
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<number | null>(
    null,
  );
  const [mySubmissionMap, setMySubmissionMap] = useState<Record<number, SubmissionDto | null>>({});

  // ref to carry assignmentId for submit mutation (void-adjacent, need context)
  const pendingSubmitRef = useRef<number | null>(null);

  const { data: assignments, isLoading, isError } = useGetData<
    AssignmentDto[],
    string | number,
    AssignmentDto[]
  >({
    queryKey: [...assignmentsKey],
    queryFn: () => assignmentService.getAssignments(courseId),
    transformFn: (d) => d.slice().sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
  });

  const invalidateAssignments = () =>
    queryClient.invalidateQueries({ queryKey: [...assignmentsKey] });

  const { mutate: createMutate, isPending: isCreating } = usePostData<
    string | number,
    { courseId: number; data: CreateAssignmentRequest },
    AssignmentDto
  >({
    keys: ['assignments', 'create'],
    serviceFn: ({ courseId: cId, data }) =>
      assignmentService.createAssignment(cId, data),
    onSuccessFn: () => {
      void invalidateAssignments();
    },
  });

  const { mutate: updateMutate } = usePostData<
    string | number,
    { id: number; data: UpdateAssignmentRequest },
    AssignmentDto
  >({
    keys: ['assignments', 'update'],
    serviceFn: ({ id, data }) => assignmentService.updateAssignment(id, data),
    onSuccessFn: () => {
      void invalidateAssignments();
    },
  });

  const { mutate: deleteMutate } = usePostData<string | number, number, void>({
    keys: ['assignments', 'delete'],
    serviceFn: (id) => assignmentService.deleteAssignment(id),
    onSuccessFn: () => {
      void invalidateAssignments();
    },
  });

  const { mutate: submitMutate } = usePostData<
    string | number,
    { assignmentId: number; file: File },
    SubmissionDto
  >({
    keys: ['assignments', 'submit'],
    serviceFn: ({ assignmentId, file }) =>
      assignmentService.submitAssignment(assignmentId, file),
    onSuccessFn: () => {
      setSubmittingAssignmentId(null);
      pendingSubmitRef.current = null;
      void invalidateAssignments();
    },
    onErrorFn: () => {
      setSubmittingAssignmentId(null);
      pendingSubmitRef.current = null;
    },
  });

  const submitAssignment = useCallback(
    (assignmentId: number, file: File) => {
      setSubmittingAssignmentId(assignmentId);
      pendingSubmitRef.current = assignmentId;
      submitMutate({ assignmentId, file });
    },
    [submitMutate],
  );

  const fetchSubmissions = useCallback(async (assignmentId: number) => {
    if (submissionsMap[assignmentId] !== undefined) return;
    try {
      const data = await assignmentService.getSubmissions(assignmentId);
      setSubmissionsMap((prev) => ({ ...prev, [assignmentId]: data }));
    } catch {
      // silently ignore
    }
  }, [submissionsMap]);

  /** Fetch the current student's own submission for a given assignment (student role only). */
  const fetchMySubmission = useCallback(async (assignmentId: number) => {
    if (mySubmissionMap[assignmentId] !== undefined) return;
    try {
      const data = await assignmentService.getMySubmission(assignmentId);
      setMySubmissionMap((prev) => ({ ...prev, [assignmentId]: data }));
    } catch {
      setMySubmissionMap((prev) => ({ ...prev, [assignmentId]: null }));
    }
  }, [mySubmissionMap]);

  const toggleSubmissions = useCallback(
    (assignmentId: number) => {
      setExpandedSubmissions((prev) => {
        const next = new Set(prev);
        if (next.has(assignmentId)) {
          next.delete(assignmentId);
        } else {
          next.add(assignmentId);
          if (role === 'TEACHER' || role === 'ADMIN') {
            void fetchSubmissions(assignmentId);
          }
        }
        return next;
      });
    },
    [fetchSubmissions, role],
  );

  return {
    assignments: assignments ?? [],
    isLoading,
    isError,
    createAssignment: (data) => createMutate({ courseId, data }),
    isCreating,
    updateAssignment: (id, data) => updateMutate({ id, data }),
    deleteAssignment: (id) => deleteMutate(id),
    submitAssignment,
    submittingAssignmentId,
    mySubmissionMap,
    fetchMySubmission,
    expandedSubmissions,
    submissionsMap,
    fetchSubmissions,
    toggleSubmissions,
    downloadSubmission: assignmentService.downloadSubmission,
  };
};

export default useCourseAssignments;
