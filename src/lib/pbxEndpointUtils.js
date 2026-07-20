/** Endpoint registration status — labels match PBX device/MAC API signals, not subscriber presence. */

export function endpointStatusBadge(status) {
  switch (status) {
    case 'online':
      return { label: 'Online', className: 'bg-green-600 hover:bg-green-600 text-white' };
    case 'offline':
      return { label: 'Unregistered', className: 'bg-red-600 hover:bg-red-600 text-white' };
    case 'no_device':
      return { label: 'No device', className: 'bg-gray-500 hover:bg-gray-500 text-white' };
    default:
      return { label: 'Unknown', className: 'bg-gray-400 hover:bg-gray-400 text-white' };
  }
}

export function endpointStatusLabel(status) {
  return endpointStatusBadge(status).label;
}

export function formatPbxDisplayValue(value) {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  const sipMatch = text.match(/^(?:sip:)?([^@;>\s]+)(?:@.*)?$/i);
  const cleaned = sipMatch?.[1] || text;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return cleaned;
}
