import useCopyToClipboard from '../../../hooks/useCopyToClipboard';

export interface UseTempPasswordPanel {
  copied: boolean;
  onCopy: () => void;
}

/**
 * Logic for `TempPasswordPanel`: wraps the shared clipboard hook so the panel
 * component stays presentational. Split out because copying is real behavior.
 */
const useTempPasswordPanel = (password: string): UseTempPasswordPanel => {
  const { copied, copy } = useCopyToClipboard();

  return {
    copied,
    onCopy: () => {
      void copy(password);
    },
  };
};

export default useTempPasswordPanel;
