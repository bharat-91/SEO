export interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
  id?: string;
}

export function ErrorAlert({ error, onDismiss, id }: ErrorAlertProps) {
  return (
    <div style={styles.container} role="alert" id={id}>
      <div style={styles.content}>
        <span style={styles.icon} aria-hidden="true">
          ⛈️
        </span>
        <div>
          <p style={styles.title}>Rough seas ahead</p>
          <p style={styles.message}>{error}</p>
        </div>
      </div>
      {onDismiss && (
        <button style={styles.button} onClick={onDismiss} aria-label="Dismiss error">
          ✕
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: 'rgba(185, 28, 28, 0.14)',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    borderRadius: '8px',
  },
  content: {
    display: 'flex',
    gap: '12px',
  },
  icon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  title: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fca5a5',
  },
  message: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#fecaca',
  },
  button: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#fca5a5',
  },
};
