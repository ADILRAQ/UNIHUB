import { useState } from 'react';
import type { ModuleDto, ResourceDto, UpdateModuleRequest } from '../types';
import ResourceItem from './ResourceItem';
import UploadButton from './UploadButton';

interface ModulePanelProps {
  module: ModuleDto;
  isExpanded: boolean;
  resources: ResourceDto[];
  isUploading: boolean;
  canEdit: boolean;
  onToggle: (id: number) => void;
  onDownload: (resourceId: number, filename: string) => void;
  onDeleteResource: (resourceId: number, moduleId: number) => void;
  onUpload: (moduleId: number, file: File) => void;
  onUpdate: (moduleId: number, data: UpdateModuleRequest) => void;
  onDelete: (moduleId: number) => void;
}

const ModulePanel = ({
  module,
  isExpanded,
  resources,
  isUploading,
  canEdit,
  onToggle,
  onDownload,
  onDeleteResource,
  onUpload,
  onUpdate,
  onDelete,
}: ModulePanelProps) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);

  const handleRename = () => {
    if (title.trim() && title !== module.title) {
      onUpdate(module.id, { title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div className={`res-module${isExpanded ? '' : ' res-module--collapsed'}`}>
      <div className="res-module__header">
        <button
          type="button"
          className="res-btn res-btn--ghost"
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
              className="res-btn res-btn--sm res-btn--ghost"
              onClick={() => setEditing(true)}
            >
              Rename
            </button>
            <button
              type="button"
              className="res-btn res-btn--sm res-btn--danger"
              onClick={() => {
                if (window.confirm(`Delete module "${module.title}"?`)) {
                  onDelete(module.id);
                }
              }}
            >
              Delete
            </button>
            <UploadButton
              moduleId={module.id}
              isUploading={isUploading}
              onUpload={onUpload}
            />
          </span>
        )}
      </div>

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
