import { useCallback, useRef, useState } from 'react';

export interface UseCopyToClipboard {
  /** True for a short window after a successful copy (drives a "Copied!" label). */
  copied: boolean;
  /** Copies `text` to the clipboard and briefly flips `copied` to true. */
  copy: (text: string) => Promise<void>;
}

/**
 * Shared clipboard helper: copies text and exposes a transient `copied` flag so
 * UI can show confirmation feedback. Lives in the shared `hooks/` folder because
 * it is generic and reused across features (e.g. the admin temp-password panels).
 */
const useCopyToClipboard = (resetAfterMs = 2000): UseCopyToClipboard => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { copied, copy };
};

export default useCopyToClipboard;
