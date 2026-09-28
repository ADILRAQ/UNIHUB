/**
 * Self-contained toast notification system.
 *
 * Usage:
 *   1. Wrap your app with <ToastProvider>.
 *   2. In any component: const toast = useToast();
 *      then call toast.success('Done!'), toast.error('Failed'), etc.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  exiting: boolean;
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Icons ──────────────────────────────────────────────────────────────────

const iconPath: Record<ToastType, string> = {
  success: 'M5 12.5l4.5 4.5L19 7.5',
  error:   'M7 7l10 10M17 7L7 17',
  warning: 'M12 8v5M12 16.5v.5',
  info:    'M12 11v6M12 7.5v.5',
};

const ToastIcon = ({ type }: { type: ToastType }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={iconPath[type]} />
  </svg>
);

// ── Provider ───────────────────────────────────────────────────────────────

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Keep a ref to avoid stale closures inside setTimeout callbacks
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    // Start exit animation then remove from DOM
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    const exitTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
    timersRef.current.set(id, exitTimer);
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Date.now();
      setToasts((prev) => [
        ...prev,
        { id, message, type, duration, exiting: false },
      ]);

      const autoTimer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, autoTimer);
    },
    [removeToast],
  );

  const handleClose = useCallback(
    (id: number) => {
      // Clear the auto-dismiss timer so we don't double-trigger
      const existing = timersRef.current.get(id);
      if (existing) {
        clearTimeout(existing);
        timersRef.current.delete(id);
      }
      removeToast(id);
    },
    [removeToast],
  );

  const contextValue: ToastContextValue = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'toast',
              `toast--${toast.type}`,
              toast.exiting ? 'toast--exiting' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="alert"
            aria-live="polite"
          >
            <span className="toast__icon" aria-hidden="true">
              <ToastIcon type={toast.type} />
            </span>
            <span className="toast__message">{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss notification"
              onClick={() => handleClose(toast.id)}
            >
              ×
            </button>
            {/* Progress bar shrinks from full to nothing over `duration` ms */}
            <div
              className="toast__progress"
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
};
