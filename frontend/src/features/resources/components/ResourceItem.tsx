import type { ResourceDto } from '../types';

interface ResourceItemProps {
  resource: ResourceDto;
  canDelete: boolean;
  onDownload: (resourceId: number, filename: string) => void;
  onDelete: (resourceId: number) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResourceItem = ({
  resource,
  canDelete,
  onDownload,
  onDelete,
}: ResourceItemProps) => (
  <div className="res-resource">
    <span className="res-resource__name">{resource.name}</span>
    <span className="res-resource__meta">
      {formatBytes(resource.sizeBytes)} &middot; {resource.uploadedByName}
    </span>
    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
      <button
        type="button"
        className="res-btn res-btn--sm res-btn--ghost"
        onClick={() => onDownload(resource.id, resource.name)}
      >
        Download
      </button>
      {canDelete && (
        <button
          type="button"
          className="res-btn res-btn--sm res-btn--danger"
          onClick={() => onDelete(resource.id)}
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

export default ResourceItem;
