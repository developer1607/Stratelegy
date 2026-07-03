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
