import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { usePermissions } from '@/hooks/usePermissions';
import { canViewPbxDomains } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';
import { displayError } from '@/lib/errors';

export default function PbxShell({ title, description, children, actions, requiresDomain = true }) {
  const { domain, domains, isLoading, error, canListDomains } = usePbxDomain();
  const { permissions, canAccessPage } = usePermissions();
  const showDomainsLink = canViewPbxDomains(permissions) && canAccessPage('PBXDomains');

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {requiresDomain && error && canListDomains && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Failed to load PBX domains</p>
          <p className="text-sm mt-1">
            {displayError(error, 'Load failed.')}
          </p>
        </div>
      )}

      {requiresDomain && !isLoading && !domain && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          {canListDomains ? (
            <>
              Select a domain below or open the{' '}
              {showDomainsLink ? (
                <Link to={createPageUrl('PBXDomains')} className="font-medium underline">
                  Domains
                </Link>
              ) : (
                'Domains'
              )}{' '}
              page from the PBX menu.
            </>
          ) : (
            <>
              Add a <span className="font-mono">?domain=your.domain</span> query parameter to the
              URL, or ask an admin for Domains access to browse available domains.
            </>
          )}
        </div>
      )}

      {typeof children === 'function' ? children({ domain, domains }) : children}
    </div>
  );
}

export function PbxLoading() {
  return (
    <div className="flex items-center justify-center py-16 text-gray-500">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      Loading…
    </div>
  );
}

export function PbxError({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="font-medium">Request failed</p>
      <p className="text-sm mt-1">
        {displayError(error, 'Load failed.')}
      </p>
      {error.data?.code === 'skyswitch_log_scope_required' &&
      displayError(error, 'Load failed.') !== 'Call logs unavailable.' ? (
        <p className="text-sm mt-2">Call logs unavailable.</p>
      ) : null}
      {error.data?.code === 'pbx_domain_scope_required' && (
        <p className="text-sm mt-2">
          Use the domain-specific live views under PBX, or ask an admin for account-wide report access.
        </p>
      )}
      {error.data?.code === 'skyswitch_report_scope_required' && (
        <p className="text-sm mt-2">Reports unavailable.</p>
      )}
      {error.data?.code === 'skyswitch_uc_config_scope_required' && (
        <p className="text-sm mt-2">UC config unavailable.</p>
      )}
      {error.data?.code === 'skyswitch_entitlement_scope_required' && (
        <p className="text-sm mt-2">Entitlements unavailable.</p>
      )}
    </div>
  );
}

export function PbxDataTable({ columns, rows, emptyMessage = 'No records found.', rowClassName }) {
  if (!rows?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-gray-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const extraClass =
                typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || '';
              return (
                <tr
                  key={row.id || row.user || row.domain || `${row.phone_number ?? 'row'}-${idx}`}
                  className={`border-b last:border-0 hover:bg-gray-50 ${extraClass}`.trim()}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-800 align-middle">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PbxStatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
