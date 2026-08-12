import { useState, FormEvent } from 'react';
import { isValidUrl, normalizeUrl } from '../../utils/validators';
import { ErrorAlert } from '../../components/ErrorAlert';
import { MIN_URL_LENGTH, MAX_URL_LENGTH } from '../../constants/ui';
import { theme } from '../../constants/theme';

export interface StartAuditFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
}

export function StartAuditForm({ onSubmit, loading, error, onDismissError }: StartAuditFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function validate(candidate: string): string | null {
    if (candidate.trim().length === 0) {
      return 'Please enter a website URL.';
    }
    if (candidate.trim().length < MIN_URL_LENGTH) {
      return 'URL is too short.';
    }
    if (candidate.trim().length > MAX_URL_LENGTH) {
      return 'URL is too long.';
    }
    const normalized = normalizeUrl(candidate);
    if (!isValidUrl(normalized)) {
      return 'Please enter a valid website URL (e.g. https://example.com).';
    }
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationMessage = validate(url);
    setValidationError(validationMessage);

    if (validationMessage) {
      return;
    }

    onSubmit(normalizeUrl(url));
  }

  function handleChange(value: string) {
    setUrl(value);
    if (validationError) {
      setValidationError(null);
    }
    if (error) {
      onDismissError();
    }
  }

  const displayError = validationError || error;

  return (
    <div style={styles.container}>
      <div style={styles.compass} aria-hidden="true">
        🧭
      </div>
      <h2 style={styles.title}>Chart Your Site's Waters</h2>
      <p style={styles.subtitle}>
        Set sail and map every technical SEO issue hiding beneath the surface.
      </p>

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <div style={styles.inputRow}>
          <input
            type="text"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://example.com"
            aria-label="Website URL"
            aria-invalid={displayError ? 'true' : 'false'}
            aria-describedby={displayError ? 'url-error' : undefined}
            disabled={loading}
            style={styles.input}
          />
          <button
            type="submit"
            className="button-primary"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Setting sail…' : '⚓ Run Audit'}
          </button>
        </div>

        {displayError && (
          <ErrorAlert
            id="url-error"
            error={displayError}
            onDismiss={validationError ? () => setValidationError(null) : onDismissError}
          />
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '620px',
    margin: '60px auto',
    textAlign: 'center' as const,
  },
  compass: {
    fontSize: '48px',
    marginBottom: '12px',
    animation: 'bob 4s ease-in-out infinite',
    display: 'inline-block',
  },
  title: {
    fontSize: '36px',
    marginBottom: '8px',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '32px',
    color: theme.textMuted,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    fontSize: '16px',
    padding: '12px 16px',
  },
  button: {
    whiteSpace: 'nowrap' as const,
    padding: '12px 24px',
    fontSize: '16px',
  },
};
