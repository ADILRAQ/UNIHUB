import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useCourses from '../hooks/useCourses';
import useCourseResources from '../hooks/useCourseResources';
import useCourseAssignments from '../hooks/useCourseAssignments';
import ModulePanel from '../components/ModulePanel';
import AssignmentItem from '../components/AssignmentItem';
import PastSessionsTab from '../../recaps/components/PastSessionsTab';
import PageHeader from '../../../components/layout/PageHeader';
import Tabs from '../../../components/ui/Tabs';

type TabKey = 'resources' | 'assignments' | 'past-sessions';

const muted = { margin: 0, fontSize: 13, color: 'var(--ink-500)' };

/* ── Resources tab ───────────────────────────────────────────────────── */

const ResourcesTab = ({ courseId, canEdit }: { courseId: number; canEdit: boolean }) => {
  const {
    modules,
    isLoadingModules,
    isErrorModules,
    expandedModules,
    toggleModule,
    resourcesByModule,
    createModule,
    isCreatingModule,
    updateModule,
    deleteModule,
    uploadResource,
    uploadingModuleId,
    addLink,
    addingLinkModuleId,
    deleteResource,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    downloadResource,
  } = useCourseResources(courseId);

  const [showNewModule, setShowNewModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const handleCreateModule = () => {
    if (!newModuleTitle.trim()) return;
    createModule({ title: newModuleTitle.trim(), displayOrder: modules.length + 1 });
    setNewModuleTitle('');
    setShowNewModule(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search */}
      <input
        type="search"
        placeholder="Search resources…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search resources"
        className="input"
        style={{ maxWidth: 360, borderRadius: 'var(--radius-full)' }}
      />

      {searchQuery.length > 0 ? (
        <>
          {isSearching && <p style={muted}>Searching…</p>}
          {!isSearching && searchResults.length === 0 && (
            <p style={muted}>No results for &ldquo;{searchQuery}&rdquo;</p>
          )}
          {searchResults.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ flexGrow: 1, fontSize: 13, color: 'var(--ink-700)' }}>{r.name}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>{r.courseName} / {r.moduleName}</span>
              <button type="button" className="btn btn--sm" onClick={() => downloadResource(r.id, r.name)}>Download</button>
            </div>
          ))}
        </>
      ) : (
        <>
          {isLoadingModules && <p style={muted}>Loading modules…</p>}
          {isErrorModules && (
            <div role="alert" className="alert">Failed to load modules.</div>
          )}
          {!isLoadingModules && modules.length === 0 && !isErrorModules && (
            <div className="empty-state">
              <h2 className="empty-state__title">No modules yet</h2>
              <p className="empty-state__body">{canEdit ? 'Add a module to start sharing files and links.' : 'Your teacher has not published any resources yet.'}</p>
            </div>
          )}
          {modules.map((mod) => (
            <ModulePanel
              key={mod.id}
              module={mod}
              isExpanded={expandedModules.has(mod.id)}
              resources={resourcesByModule[mod.id] ?? []}
              isUploading={uploadingModuleId === mod.id}
              isAddingLink={addingLinkModuleId === mod.id}
              canEdit={canEdit}
              onToggle={toggleModule}
              onDownload={downloadResource}
              onDeleteResource={deleteResource}
              onUpload={uploadResource}
              onAddLink={addLink}
              onUpdate={updateModule}
              onDelete={deleteModule}
            />
          ))}
          {canEdit && (
            <div>
              {showNewModule ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Module title"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateModule();
                      if (e.key === 'Escape') setShowNewModule(false);
                    }}
                    autoFocus
                    aria-label="Module title"
                    className="input"
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn--primary btn--sm" disabled={isCreatingModule || !newModuleTitle.trim()} onClick={handleCreateModule}>Add module</button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowNewModule(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="btn btn--soft" onClick={() => setShowNewModule(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5v13M5.5 12h13"/></svg>
                  Add module
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Assignments tab ─────────────────────────────────────────────────── */

const AssignmentsTab = ({
  courseId,
  role,
}: {
  courseId: number;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}) => {
  const {
    assignments,
    isLoading,
    isError,
    createAssignment,
    isCreating,
    deleteAssignment,
    submitAssignment,
    submittingAssignmentId,
    mySubmissionMap,
    fetchMySubmission,
    expandedSubmissions,
    submissionsMap,
    toggleSubmissions,
    downloadSubmission,
  } = useCourseAssignments(courseId, role);

  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueAt, setNewDueAt] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim() || !newDueAt) return;
    createAssignment({ title: newTitle.trim(), description: newDescription.trim() || undefined, dueAt: new Date(newDueAt).toISOString() });
    setNewTitle(''); setNewDescription(''); setNewDueAt('');
    setShowNewAssignment(false);
  };

  if (isLoading) return <div className="skeleton" style={{ height: 140 }} />;
  if (isError) return <div role="alert" className="alert">Failed to load assignments.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {assignments.length === 0 && (
        <div className="empty-state">
          <h2 className="empty-state__title">No assignments yet</h2>
          <p className="empty-state__body">Homework and due dates for this course will appear here.</p>
        </div>
      )}
      {assignments.map((a) => (
        <AssignmentItem
          key={a.id}
          assignment={a}
          role={role}
          isExpanded={expandedSubmissions.has(a.id)}
          submissions={submissionsMap[a.id]}
          isSubmitting={submittingAssignmentId === a.id}
          mySubmission={mySubmissionMap[a.id]}
          onToggleSubmissions={toggleSubmissions}
          onSubmit={submitAssignment}
          onDelete={deleteAssignment}
          onDownloadSubmission={downloadSubmission}
          onFetchMySubmission={fetchMySubmission}
        />
      ))}
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <div>
          {showNewAssignment ? (
            <div className="sched-form res-assignment-form">
              <label className="sched-field"><span>Title</span>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
              </label>
              <label className="sched-field"><span>Description (optional)</span>
                <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              </label>
              <label className="sched-field"><span>Due</span>
                <input type="datetime-local" value={newDueAt} onChange={(e) => setNewDueAt(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn--primary btn--sm" disabled={isCreating || !newTitle.trim() || !newDueAt} onClick={handleCreate}>Add assignment</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowNewAssignment(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn--soft" onClick={() => setShowNewAssignment(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5.5v13M5.5 12h13"/></svg>
              Add assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Course detail page ──────────────────────────────────────────────── */

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { courses } = useCourses();
  const initialTab = (searchParams.get('tab') as TabKey | null) ?? 'resources';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const id = Number(courseId);
  const role = user?.role ?? 'STUDENT';
  const canEdit = role === 'TEACHER' || role === 'ADMIN';

  const course = courses.find((c) => c.id === id);

  if (!courseId || isNaN(id)) {
    return (
      <div className="page-body">
        <div role="alert" className="alert">Invalid course ID.</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={course?.name ?? 'Course'}
        subtitle={course ? `${course.teacherName} · ${course.classGroupName}` : undefined}
        breadcrumb="All courses"
        breadcrumbTo="/courses"
      />

      <div className="page-body" style={{ maxWidth: 884 }}>
        <Tabs
          tabs={[
            { key: 'resources', label: 'Resources' },
            { key: 'assignments', label: 'Assignments' },
            { key: 'past-sessions', label: 'Past sessions' },
          ]}
          active={activeTab}
          onSelect={setActiveTab}
          label="Course sections"
        />
          {activeTab === 'resources' && <ResourcesTab courseId={id} canEdit={canEdit} />}
          {activeTab === 'assignments' && <AssignmentsTab courseId={id} role={role as 'STUDENT' | 'TEACHER' | 'ADMIN'} />}
          {activeTab === 'past-sessions' && <PastSessionsTab courseId={id} />}
      </div>
    </>
  );
};

export default CoursePage;
