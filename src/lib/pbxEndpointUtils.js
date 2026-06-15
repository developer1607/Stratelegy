/** Endpoint online/offline badge helpers. */

export function endpointStatusBadge(status) {
  switch (status) {
    case 'online':
      return { label: 'Online', className: 'bg-green-600 hover:bg-green-600 text-white' };
    case 'offline':
      return { label: 'Offline', className: 'bg-red-600 hover:bg-red-600 text-white' };
    default:
      return { label: 'Unknown', className: 'bg-gray-400 hover:bg-gray-400 text-white' };
  }
}
