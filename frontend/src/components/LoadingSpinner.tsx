import { theme } from '../constants/theme';

export interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div style={styles.container} role="status" aria-live="polite">
      <div style={styles.spinnerWrap}>
        <div className="spinner" style={styles.spinner} aria-hidden="true" />
        <span style={styles.compass} aria-hidden="true">
          🧭
        </span>
      </div>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  spinnerWrap: {
    position: 'relative' as const,
    width: '64px',
    height: '64px',
  },
  spinner: {
    width: '64px',
    height: '64px',
    border: '4px solid rgba(245, 183, 0, 0.15)',
    borderTop: '4px solid #f5b700',
    borderRight: '4px solid #22d3ee',
    borderRadius: '50%',
    animation: 'spin 1.1s linear infinite',
  },
  compass: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '26px',
  },
  message: {
    marginTop: '24px',
    color: theme.textMuted,
    fontSize: '16px',
    textAlign: 'center' as const,
    maxWidth: '360px',
  },
};
