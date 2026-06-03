/** Map API errors to user-friendly messages — never show SQL or raw server internals. */
export function getUserFacingErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const code = error?.data?.code || error?.extra_data?.reason;
  if (code === 'skyswitch_report_scope_required') {
    return 'Report access is not enabled for this account. Contact your administrator.';
  }
  if (code === 'skyswitch_log_scope_required') {
    return 'Log access is not enabled for this account. Contact your administrator.';
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
