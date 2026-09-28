import { useState } from 'react';
import type { ModuleDto, ResourceDto, UpdateModuleRequest } from '../types';
import ResourceItem from './ResourceItem';
import UploadButton from './UploadButton';

interface ModulePanelProps {
  module: ModuleDto;
  isExpanded: boolean;
  resources: ResourceDto[];
  isUploading: boolean;
  isAddingLink: boolean;
  canEdit: boolean;
  onToggle: (id: number) => void;
  onDownload: (resourceId: number, filename: string) => void;
  onDeleteResource: (resourceId: number, moduleId: number) => void;
  onUpload: (moduleId: number, file: File) => void;
  onAddLink: (moduleId: number, title: string, url: string) => void;
  onUpdate: (moduleId: number, data: UpdateModuleRequest) => void;
  onDelete: (moduleId: number) => void;
}

const ModulePanel = ({
  module,
  isExpanded,
  resources,
  isUploading,
  isAddingLink,
  canEdit,
  onToggle,
  onDownload,
  onDeleteResource,
  onUpload,
  onAddLink,
  onUpdate,
  onDelete,
}: ModulePanelProps) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleRename = () => {
    if (title.trim() && title !== module.title) {
      onUpdate(module.id, { title: title.trim() });
    }
    setEditing(false);
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    onAddLink(module.id, linkTitle.trim(), linkUrl.trim());
    setLinkTitle('');
    setLinkUrl('');
    setShowLinkForm(false);
  };

  return (
    <div className={`res-module${isExpanded ? '' : ' res-module--collapsed'}`}>
      <div className="res-module__header">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onToggle(module.id)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {editing ? (
          <input
            className="res-module__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setTitle(module.title);
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span className="res-module__title">{module.title}</span>
        )}

        {canEdit && (
          <span style={{ display: 'flex', gap: 'var(--space-1)', marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => setEditing(true)}
            >
              Rename
            </button>
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={() => {
                if (window.confirm(`Delete module "${module.title}"?`)) {
                  onDelete(module.id);
                }
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => setShowLinkForm((v) => !v)}
              disabled={isAddingLink}
              title="Add external link"
            >
              Add link
            </button>
            <UploadButton
              moduleId={module.id}
              isUploading={isUploading}
              onUpload={onUpload}
            />
          </span>
        )}
      </div>

      {/* Inline link form */}
      {canEdit && showLinkForm && (
        <div
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3)',
            background: 'var(--cream-100)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Link title"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              disabled={isAddingLink}
              className="input"
              style={{ flexGrow: 1, flexBasis: 0, width: 'auto', minWidth: 160, background: 'var(--white)' }}
            />
            <input
              type="url"
              placeholder="https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={isAddingLink}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddLink();
                if (e.key === 'Escape') setShowLinkForm(false);
              }}
              className="input"
              style={{ flexGrow: 2, flexBasis: 0, width: 'auto', minWidth: 200, background: 'var(--white)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              disabled={isAddingLink || !linkTitle.trim() || !linkUrl.trim()}
              onClick={handleAddLink}
            >
              {isAddingLink ? 'Adding…' : 'Add link'}
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => setShowLinkForm(false)}
              disabled={isAddingLink}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div style={{ paddingLeft: 'var(--space-6)' }}>
          {resources.length === 0 ? (
            <p className="res-resource__meta" style={{ margin: 'var(--space-2) 0' }}>
              No files yet.
            </p>
          ) : (
            resources.map((r) => (
              <ResourceItem
                key={r.id}
                resource={r}
                canDelete={canEdit}
                onDownload={onDownload}
                onDelete={(rid) => onDeleteResource(rid, module.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModulePanel;
