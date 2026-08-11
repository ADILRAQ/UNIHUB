/** Recaps-feature-local types. */

/** Summary of a past session as returned by GET /api/courses/{courseId}/sessions?past=true */
export interface SessionSummary {
  id: number;
  date: string;
  title: string;
  courseId: number;
  hasRecap: boolean;
}

/** A resource linked to a recap (subset of ResourceDto, using backend's title alias). */
export interface RecapResource {
  id: number;
  title: string;
  type: string;
}

/** An assignment linked to a recap. */
export interface RecapAssignment {
  id: number;
  title: string;
  dueDate: string;
}

/** Full recap response from GET /api/sessions/{sessionId}/recap */
export interface SessionRecap {
  recordingUrl?: string;
  notesHtml?: string;
  linkedResources: RecapResource[];
  linkedAssignments: RecapAssignment[];
  recapUpdatedAt?: string;
}

/** PUT /api/sessions/{sessionId}/recap request body. */
export interface RecapUpdatePayload {
  recordingUrl?: string;
  notesHtml?: string;
  linkedResourceIds?: number[];
  linkedAssignmentIds?: number[];
}
