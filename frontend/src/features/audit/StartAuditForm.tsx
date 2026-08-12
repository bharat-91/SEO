import { useRef, useState, FormEvent } from 'react';
import { isValidUrl, normalizeUrl } from '../../utils/validators';
import { ErrorAlert } from '../../components/ErrorAlert';
import { MIN_URL_LENGTH, MAX_URL_LENGTH } from '../../constants/ui';

export interface StartAuditFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
}

const EXAMPLES = ['example.com', 'wikipedia.org', 'nodejs.org', 'zensorsolutions.com'];

const FEATURES = [
  { icon: '🧭', title: 'Navigation-aware', note: 'Finds your primary menu and audits the pages it links to.' },
  { icon: '🏷️', title: 'Metadata checks', note: 'Titles, meta descriptions, canonicals and robots directives.' },
  { icon: '🔠', title: 'Structure checks', note: 'H1 usage, HTTP status codes and internal link counts.' },
  { icon: '📦', title: 'Weight checks', note: 'Flags pages heavier than 2 MB that will slow crawlers down.' },
];

export function StartAuditForm({
  onSubmit,
  loading,
  error,
  onDismissError,
}: StartAuditFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(candidate: string): string | null {
    const trimmed = candidate.trim();

    if (trimmed.length === 0) return 'Please enter a website URL.';
    if (trimmed.length < MIN_URL_LENGTH) return 'That URL looks too short.';
    if (trimmed.length > MAX_URL_LENGTH) return 'That URL is too long.';
    if (!isValidUrl(normalizeUrl(trimmed))) {
      return 'Please enter a valid website URL, for example https://example.com';
    }
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const message = validate(url);
    setValidationError(message);
    if (message) {
      inputRef.current?.focus();
      return;
    }

    onSubmit(normalizeUrl(url));
  }

  function handleChange(value: string) {
    setUrl(value);
    if (validationError) setValidationError(null);
    if (error) onDismissError();
  }

  function useExample(example: string) {
    setUrl(example);
    setValidationError(null);
    if (error) onDismissError();
    inputRef.current?.focus();
  }

  const displayError = validationError ?? error;

  return (
    <div className="hero">
      <span className="hero-badge rise" style={{ ['--i' as string]: 0 }}>
        <span aria-hidden="true">🏴‍☠️</span> Technical SEO Audit
      </span>

      <h1 className="hero-title rise" style={{ ['--i' as string]: 1 }}>
        Chart your site&rsquo;s <span className="hero-accent">hidden waters</span>
      </h1>

      <p className="hero-sub rise" style={{ ['--i' as string]: 2 }}>
        Crawl your homepage and primary navigation, then surface every technical SEO
        issue lurking beneath — in seconds.
      </p>

      <form
        onSubmit={handleSubmit}
        className="hero-form rise"
        style={{ ['--i' as string]: 3 }}
        noValidate
      >
        <div className="hero-row">
          <input
            ref={inputRef}
            type="text"
            className="field"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://example.com"
            aria-label="Website URL"
            aria-invalid={displayError ? 'true' : 'false'}
            aria-describedby={displayError ? 'url-error' : undefined}
            disabled={loading}
            autoComplete="url"
            spellCheck={false}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              'Setting sail…'
            ) : (
              <>
                <span aria-hidden="true">⚓</span> Run Audit
              </>
            )}
          </button>
        </div>

        <div className="hero-examples">
          <span>Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="example-chip"
              onClick={() => useExample(example)}
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>

        {displayError && (
          <ErrorAlert
            id="url-error"
            error={displayError}
            title={validationError ? 'Check that URL' : 'Rough seas ahead'}
            onDismiss={
              validationError ? () => setValidationError(null) : onDismissError
            }
          />
        )}
      </form>

      <div className="features">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className="feature rise"
            style={{ ['--i' as string]: i + 4 }}
          >
            <span className="feature-icon" aria-hidden="true">
              {feature.icon}
            </span>
            <p className="feature-title">{feature.title}</p>
            <p className="feature-note">{feature.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
