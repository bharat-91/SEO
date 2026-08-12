export interface LoadingSpinnerProps {
  title?: string;
  message?: string;
  /** Extra line under the message, e.g. elapsed time. */
  meta?: string;
  showBar?: boolean;
}

export function LoadingSpinner({
  title = 'Loading',
  message,
  meta,
  showBar = false,
}: LoadingSpinnerProps) {
  return (
    <div className="progress-wrap" role="status" aria-live="polite">
      <div className="compass">
        <span className="compass-ring is-outer" aria-hidden="true" />
        <span className="compass-ring" aria-hidden="true" />
        <span className="compass-face" aria-hidden="true">
          🧭
        </span>
      </div>

      <p className="progress-title">{title}</p>
      {message && <p className="progress-note">{message}</p>}
      {showBar && <div className="progress-bar" aria-hidden="true" />}
      {meta && <p className="progress-meta tnum">{meta}</p>}
    </div>
  );
}
