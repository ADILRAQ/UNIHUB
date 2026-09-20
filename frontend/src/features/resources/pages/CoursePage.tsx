import { useState, type CSSProperties } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useCourses from '../hooks/useCourses';
import useCourseResources from '../hooks/useCourseResources';
import useCourseAssignments from '../hooks/useCourseAssignments';
import ModulePanel from '../components/ModulePanel';
import AssignmentItem from '../components/AssignmentItem';
import PastSessionsTab from '../../recaps/components/PastSessionsTab';

type TabKey = 'resources' | 'assignments' | 'past-sessions';

/* ── Shared tab button style helpers ─────────────────────────────────── */

const tabStyle = (active: boolean): CSSProperties => ({
  background: 'none',
  border: 0,
  cursor: 'pointer',
  padding: '0 0 14px 0',
  fontSize: 14.5,
  fontWeight: 600,
  color: active ? '#4A41C9' : '#6B6B7B',
  borderBottom: `2px solid ${active ? '#4A41C9' : 'transparent'}`,
  transition: 'color 0.15s, border-color 0.15s',
});

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
        style={{ height: 42, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', maxWidth: 360, outline: 'none', fontFamily: 'inherit' }}
      />

      {searchQuery.length > 0 ? (
        <>
          {isSearching && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>Searching…</p>}
          {!isSearching && searchResults.length === 0 && (
            <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>No results for &ldquo;{searchQuery}&rdquo;</p>
          )}
          {searchResults.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0EEFA' }}>
              <span style={{ flexGrow: 1, fontSize: 13.5, color: '#33314A' }}>{r.name}</span>
              <span style={{ fontSize: 12, color: '#8D8B9C' }}>{r.courseName} / {r.moduleName}</span>
              <button type="button" onClick={() => downloadResource(r.id, r.name)} style={{ height: 32, padding: '0 12px', border: '1px solid #E1DEF2', borderRadius: 8, background: '#FFFFFF', color: '#45435A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Download</button>
            </div>
          ))}
        </>
      ) : (
        <>
          {isLoadingModules && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>Loading modules…</p>}
          {isErrorModules && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>Failed to load modules.</div>
          )}
          {!isLoadingModules && modules.length === 0 && !isErrorModules && (
            <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>No modules yet.</p>
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
                    style={{ height: 42, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" disabled={isCreatingModule} onClick={handleCreateModule} style={{ height: 38, padding: '0 14px', border: 0, borderRadius: 9, background: '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Add module</button>
                    <button type="button" onClick={() => setShowNewModule(false)} style={{ height: 38, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', color: '#45435A', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewModule(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: '1px dashed #C9C2F5', borderRadius: 10, background: '#FFFFFF', color: '#4A41C9', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
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

  if (isLoading) return <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>Loading assignments…</p>;
  if (isError) return <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>Failed to load assignments.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {assignments.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: '#6B6B7B' }}>No assignments yet.</p>}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#FFFFFF', border: '1px solid #EDEBF8', borderRadius: 14, padding: '20px 22px' }}>
              <input type="text" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus style={{ height: 42, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }} />
              <input type="text" placeholder="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} style={{ height: 42, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }} />
              <input type="datetime-local" value={newDueAt} onChange={(e) => setNewDueAt(e.target.value)} style={{ height: 42, boxSizing: 'border-box', border: '1px solid #E1DEF2', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1F1B33', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" disabled={isCreating} onClick={handleCreate} style={{ height: 38, padding: '0 14px', border: 0, borderRadius: 9, background: '#5A4FE0', color: '#FFFFFF', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Add assignment</button>
                <button type="button" onClick={() => setShowNewAssignment(false)} style={{ height: 38, padding: '0 14px', border: '1px solid #E1DEF2', borderRadius: 9, background: '#FFFFFF', color: '#45435A', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowNewAssignment(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: '1px dashed #C9C2F5', borderRadius: 10, background: '#FFFFFF', color: '#4A41C9', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
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
      <main style={{ padding: 32 }}>
        <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #F7A9A9', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#B91C1C' }}>Invalid course ID.</div>
      </main>
    );
  }

  return (
    <>
      {/* Custom header: breadcrumb + title + tabs */}
      <header style={{ flexShrink: 0, boxSizing: 'border-box', background: '#FFFFFF', borderBottom: '1px solid #E8E6F5', padding: '22px 32px 0 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#6B6B7B', fontSize: 13, fontWeight: 600, textDecoration: 'none', width: 'fit-content' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>
            Courses
          </Link>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1F1B33', letterSpacing: '-0.02em' }}>
            {course?.name ?? 'Course'}
          </h1>
          {course && (
            <span style={{ fontSize: 13, color: '#6B6B7B' }}>
              {course.teacherName} · {course.classGroupName}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {(['resources', 'assignments', 'past-sessions'] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={tabStyle(activeTab === tab)}>
              {tab === 'resources' ? 'Resources' : tab === 'assignments' ? 'Assignments' : 'Past Sessions'}
            </button>
          ))}
        </div>
      </header>

      <main style={{ flexGrow: 1, boxSizing: 'border-box', padding: '28px 32px 40px 32px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {activeTab === 'resources' && <ResourcesTab courseId={id} canEdit={canEdit} />}
          {activeTab === 'assignments' && <AssignmentsTab courseId={id} role={role as 'STUDENT' | 'TEACHER' | 'ADMIN'} />}
          {activeTab === 'past-sessions' && <PastSessionsTab courseId={id} />}
        </div>
      </main>
    </>
  );
};

export default CoursePage;
