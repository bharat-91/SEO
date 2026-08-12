export interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
  id?: string;
  title?: string;
}

export function ErrorAlert({
  error,
  onDismiss,
  id,
  title = 'Rough seas ahead',
}: ErrorAlertProps) {
  return (
    <div className="alert" role="alert" id={id}>
      <div className="alert-body">
        <span className="alert-icon" aria-hidden="true">
          ⛈️
        </span>
        <div>
          <p className="alert-title">{title}</p>
          <p className="alert-msg">{error}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert-x"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}
