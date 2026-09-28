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
}: ResourceItemProps) => {
  const isLink = resource.type === 'LINK';

  return (
    <div className="res-resource">
      <span className="res-resource__name">
        {isLink && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--orange-700)' }}
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        {resource.name}
      </span>
      <span className="res-resource__meta">
        {isLink ? 'External link' : formatBytes(resource.sizeBytes)} &middot;{' '}
        {resource.uploadedByName}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
        {isLink ? (
          <a
            href={resource.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--sm btn--ghost"
            style={{ textDecoration: 'none' }}
          >
            Open link
          </a>
        ) : (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => onDownload(resource.id, resource.name)}
          >
            Download
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            className="btn btn--sm btn--danger"
            onClick={() => onDelete(resource.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceItem;
