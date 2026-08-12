import { getIssueDefinition } from '../constants/issues';
import { getSeverityColor } from '../utils/formatters';

export interface IssueBadgeProps {
  code: string;
}

export function IssueBadge({ code }: IssueBadgeProps) {
  const definition = getIssueDefinition(code);
  const color = getSeverityColor(definition.severity);

  return (
    <span style={{ ...styles.badge, backgroundColor: color }} title={code}>
      {definition.message}
    </span>
  );
}

const styles = {
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '4px',
    marginRight: '4px',
    marginBottom: '4px',
  },
};
