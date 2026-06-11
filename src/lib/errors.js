export function displayError(error, fallback = 'Request failed.') {
  if (!error) return fallback;

  const code = error?.data?.code || error?.extra_data?.reason;
  if (code === 'skyswitch_report_scope_required') return 'Reports unavailable.';
  if (code === 'skyswitch_log_scope_required') return 'Call logs unavailable.';
  if (code === 'skyswitch_uc_config_scope_required') return 'UC config unavailable.';
  if (code === 'skyswitch_entitlement_scope_required') return 'Entitlements unavailable.';

  const message = error?.message || '';
  if (/sql|mysql|syntax error|unknown column|ER_/i.test(message)) return fallback;
  if (message && message.length < 200 && !message.includes(' at ')) return message;

  return fallback;
}
