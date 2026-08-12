import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

/**
 * Narration shown while an audit runs.
 *
 * The backend does not report per-stage progress (see Known Limitations), so
 * these lines describe the pipeline the crawler is working through rather than
 * claiming live per-page status. They are deliberately worded as descriptions
 * of the process, never as fabricated counts.
 */
const STAGES = [
  'Fetching the homepage…',
  'Looking for the primary navigation…',
  'Mapping internal links…',
  'Checking titles and meta descriptions…',
  'Inspecting headings, canonicals and robots directives…',
  'Measuring page weight and internal links…',
  'Compiling the report…',
];

const STAGE_MS = 2600;

export function AuditProgress() {
  const [stage, setStage] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      // Hold on the last line rather than looping, so it doesn't look like
      // the audit restarted.
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, STAGE_MS);

    const clockTimer = setInterval(() => setSeconds((prev) => prev + 1), 1000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(clockTimer);
    };
  }, []);

  return (
    <div className="panel panel-pad fade">
      <LoadingSpinner
        title="Audit in progress"
        message={STAGES[stage]}
        meta={`Elapsed ${seconds}s`}
        showBar
      />
    </div>
  );
}
