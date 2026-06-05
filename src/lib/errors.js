/** Map API errors to user-friendly messages — never show SQL or raw server internals. */
export function getUserFacingErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {
  if (!error) return fallback;

  const code = error?.data?.code || error?.extra_data?.reason;
  if (code === 'skyswitch_report_scope_required') {
    return 'Report access requires the report OAuth scope. Ask your administrator to add report to SKYSWITCH_SCOPE.';
  }
  if (code === 'skyswitch_log_scope_required') {
    return 'Call log access requires the log OAuth scope. Ask your administrator to add log to SKYSWITCH_SCOPE.';
  }

  const message = error?.message || '';
  if (/sql|mysql|syntax error|unknown column|ER_/i.test(message)) {
    return fallback;
  }

  if (message && message.length < 200 && !message.includes(' at ')) {
    return message;
  }

  return fallback;
}
