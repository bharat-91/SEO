export interface HttpStatusCheckResult {
  issues: string[];
}

export function checkHttpStatus(statusCode: number | null): HttpStatusCheckResult {
  const issues: string[] = [];

  if (statusCode === null || statusCode < 200 || statusCode >= 300) {
    issues.push('NON_200');
  }

  return { issues };
}
