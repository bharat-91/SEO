import type { AuditStatus } from '../types/audit';
import type { Severity } from './health';

/** Strips the protocol and any trailing slash for compact display. */
export function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.host}${path}${parsed.search}`;
  } catch {
    return url;
  }
}

/** Path-only label, used in the page table where the host is already known. */
export function formatPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatDuration(fromIso?: string, toIso?: string): string {
  if (!fromIso || !toIso) return '—';
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function formatKb(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;
}

/** Modifier class for the audit status pill. */
export function statusClass(status: AuditStatus): string {
  return `is-${status.toLowerCase()}`;
}

/** Text-colour class for a severity. */
export function severityTextClass(severity: Severity): string {
  if (severity === 'critical') return 'sev-critical';
  if (severity === 'warning') return 'sev-warning';
  return 'sev-good';
}

/** Chip variant class for a severity. */
export function severityChipClass(severity: Severity): string {
  if (severity === 'critical') return 'chip-crit';
  if (severity === 'warning') return 'chip-warn';
  return 'chip-good';
}

/** Chip variant for an HTTP status code. */
export function httpChipClass(status: number | null): string {
  if (status === null) return 'chip-crit';
  if (status >= 200 && status < 300) return 'chip-good';
  if (status >= 300 && status < 400) return 'chip-warn';
  return 'chip-crit';
}
