import { useRef } from 'react';
import type { ChangeEvent } from 'react';

interface UploadButtonProps {
  moduleId: number;
  isUploading: boolean;
  onUpload: (moduleId: number, file: File) => void;
  label?: string;
  accept?: string;
}

const UploadButton = ({
  moduleId,
  isUploading,
  onUpload,
  label = 'Upload file',
  accept,
}: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(moduleId, file);
    }
    // Reset so the same file can be re-uploaded
    e.target.value = '';
  };

  return (
    <span className={`res-upload${isUploading ? ' res-upload--loading' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn btn--sm btn--primary"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? 'Uploading…' : label}
      </button>
    </span>
  );
};

export default UploadButton;
