import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useCourseResources from '../hooks/useCourseResources';
import useCourseAssignments from '../hooks/useCourseAssignments';
import ModulePanel from '../components/ModulePanel';
import AssignmentItem from '../components/AssignmentItem';

type TabKey = 'resources' | 'assignments';

/**
 * Sub-component for the Resources tab — keeps resource state in its own scope
 * so it is only instantiated when the tab is active.
 */
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
    <div>
      {/* Search bar */}
      <div className="res-search">
        <input
          type="search"
          placeholder="Search resources…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            fontSize: '0.9rem',
            width: '100%',
            maxWidth: '360px',
            background: 'transparent',
            color: 'inherit',
          }}
        />
      </div>

      {/* Search results */}
      {searchQuery.length > 0 ? (
        <div style={{ marginTop: '1rem' }}>
          {isSearching && <p className="res-resource__meta">Searching…</p>}
          {!isSearching && searchResults.length === 0 && (
            <p className="res-resource__meta">No results for &ldquo;{searchQuery}&rdquo;</p>
          )}
          {searchResults.map((r) => (
            <div key={r.id} className="res-resource">
              <span className="res-resource__name">{r.name}</span>
              <span className="res-resource__meta">
                {r.courseName} / {r.moduleName}
              </span>
              <button
                type="button"
                className="res-btn res-btn--sm res-btn--ghost"
                onClick={() => downloadResource(r.id, r.name)}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Module tree */
        <div style={{ marginTop: '1rem' }}>
          {isLoadingModules && <p className="res-resource__meta">Loading modules…</p>}
          {isErrorModules && (
            <p style={{ color: '#b3261e' }}>Failed to load modules.</p>
          )}

          {!isLoadingModules && modules.length === 0 && !isErrorModules && (
            <p className="res-resource__meta">No modules yet.</p>
          )}

          {modules.map((mod) => (
            <ModulePanel
              key={mod.id}
              module={mod}
              isExpanded={expandedModules.has(mod.id)}
              resources={resourcesByModule[mod.id] ?? []}
              isUploading={uploadingModuleId === mod.id}
              canEdit={canEdit}
              onToggle={toggleModule}
              onDownload={downloadResource}
              onDeleteResource={deleteResource}
              onUpload={uploadResource}
              onUpdate={updateModule}
              onDelete={deleteModule}
            />
          ))}

          {canEdit && (
            <div style={{ marginTop: '1rem' }}>
              {showNewModule ? (
                <div className="res-form">
                  <div className="res-form__field">
                    <label style={{ fontSize: '0.85rem', color: '#57606a' }}>
                      Module title
                    </label>
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateModule();
                        if (e.key === 'Escape') setShowNewModule(false);
                      }}
                      autoFocus
                      style={{
                        padding: '0.5rem 0.6rem',
                        border: '1px solid #d0d7de',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: 'transparent',
                        color: 'inherit',
                      }}
                    />
                  </div>
                  <div className="res-form__actions">
                    <button
                      type="button"
                      className="res-btn res-btn--primary"
                      disabled={isCreatingModule}
                      onClick={handleCreateModule}
                    >
                      Add module
                    </button>
                    <button
                      type="button"
                      className="res-btn res-btn--ghost"
                      onClick={() => setShowNewModule(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="res-btn res-btn--primary"
                  onClick={() => setShowNewModule(true)}
                >
                  + Add module
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Sub-component for the Assignments tab.
 */
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
    createAssignment({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      dueAt: newDueAt,
    });
    setNewTitle('');
    setNewDescription('');
    setNewDueAt('');
    setShowNewAssignment(false);
  };

  if (isLoading) return <p className="res-resource__meta">Loading assignments…</p>;
  if (isError) return <p style={{ color: '#b3261e' }}>Failed to load assignments.</p>;

  return (
    <div>
      {assignments.length === 0 ? (
        <p className="res-resource__meta">No assignments yet.</p>
      ) : (
        assignments.map((a) => (
          <AssignmentItem
            key={a.id}
            assignment={a}
            role={role}
            isExpanded={expandedSubmissions.has(a.id)}
            submissions={submissionsMap[a.id]}
            isSubmitting={submittingAssignmentId === a.id}
            onToggleSubmissions={toggleSubmissions}
            onSubmit={submitAssignment}
            onDelete={deleteAssignment}
            onDownloadSubmission={downloadSubmission}
          />
        ))
      )}

      {(role === 'TEACHER' || role === 'ADMIN') && (
        <div style={{ marginTop: '1.25rem' }}>
          {showNewAssignment ? (
            <div className="res-form">
              <div className="res-form__field">
                <label style={{ fontSize: '0.85rem', color: '#57606a' }}>Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  style={{
                    padding: '0.5rem 0.6rem',
                    border: '1px solid #d0d7de',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    background: 'transparent',
                    color: 'inherit',
                  }}
                />
              </div>
              <div className="res-form__field">
                <label style={{ fontSize: '0.85rem', color: '#57606a' }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    padding: '0.5rem 0.6rem',
                    border: '1px solid #d0d7de',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    background: 'transparent',
                    color: 'inherit',
                  }}
                />
              </div>
              <div className="res-form__field">
                <label style={{ fontSize: '0.85rem', color: '#57606a' }}>Due date</label>
                <input
                  type="datetime-local"
                  value={newDueAt}
                  onChange={(e) => setNewDueAt(e.target.value)}
                  style={{
                    padding: '0.5rem 0.6rem',
                    border: '1px solid #d0d7de',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    background: 'transparent',
                    color: 'inherit',
                  }}
                />
              </div>
              <div className="res-form__actions">
                <button
                  type="button"
                  className="res-btn res-btn--primary"
                  disabled={isCreating}
                  onClick={handleCreate}
                >
                  Add assignment
                </button>
                <button
                  type="button"
                  className="res-btn res-btn--ghost"
                  onClick={() => setShowNewAssignment(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="res-btn res-btn--primary"
              onClick={() => setShowNewAssignment(true)}
            >
              + Add assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/** Course detail page — two tabs: Resources and Assignments. */
const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('resources');

  const id = Number(courseId);
  const role = user?.role ?? 'STUDENT';
  const canEdit = role === 'TEACHER' || role === 'ADMIN';

  if (!courseId || isNaN(id)) {
    return <p style={{ color: '#b3261e' }}>Invalid course ID.</p>;
  }

  return (
    <div className="res-page">
      <Link to="/courses" className="res-btn res-btn--ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to courses
      </Link>

      <div className="res-tabs">
        <button
          type="button"
          className={`res-tab${activeTab === 'resources' ? ' res-tab--active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
        <button
          type="button"
          className={`res-tab${activeTab === 'assignments' ? ' res-tab--active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        {activeTab === 'resources' && (
          <ResourcesTab courseId={id} canEdit={canEdit} />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab courseId={id} role={role as 'STUDENT' | 'TEACHER' | 'ADMIN'} />
        )}
      </div>
    </div>
  );
};

export default CoursePage;
