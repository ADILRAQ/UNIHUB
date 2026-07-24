/** Resources-feature-local types. */

export interface ModuleDto {
  id: number;
  courseId: number;
  title: string;
  displayOrder: number;
  createdAt: string;
  resourceCount: number;
}

export interface ResourceDto {
  id: number;
  moduleId: number;
  name: string;
  contentType: string;
  sizeBytes: number;
  uploadedById: number;
  uploadedByName: string;
  createdAt: string;
}

export interface ResourceSearchResult extends ResourceDto {
  moduleName: string;
  courseName: string;
}

export interface AssignmentDto {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  dueAt: string;
  createdAt: string;
  mySubmissionStatus: 'SUBMITTED' | 'LATE_SUBMITTED' | 'MISSING' | null;
  mySubmittedAt: string | null;
}

export interface SubmissionDto {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  originalName: string;
  contentType: string;
  submittedAt: string;
  late: boolean;
}

export interface SubmissionStatusDto {
  studentId: number;
  studentName: string;
  status: 'SUBMITTED' | 'LATE_SUBMITTED' | 'MISSING';
  submission: SubmissionDto | null;
}

export interface CreateModuleRequest {
  title: string;
  displayOrder: number;
}

export interface UpdateModuleRequest {
  title?: string;
  displayOrder?: number;
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  dueAt: string;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  dueAt?: string;
}
