import React from 'react';
import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

const ENTITY_LIST_PAGES = {
  Contact: 'Contacts',
  Account: 'Accounts',
  Opportunity: 'Opportunities',
  Lead: 'Leads',
};

/** CRM list page for a related record type, when the app has one. */
export function relatedRecordListPage(type) {
  return ENTITY_LIST_PAGES[type] || null;
}

export function hasRelatedRecord(record) {
  return Boolean(record?.related_to_type && (record?.related_to_name || record?.related_to_id));
}

/**
 * Shows a linked CRM record (Contact, Account, etc.) with navigation to that module.
 */
export default function RelatedRecordLink({
  type,
  name,
  className = '',
  showIcon = true,
  prefix = 'Linked',
}) {
  if (!type || !name) return null;

  const page = relatedRecordListPage(type);
  const label = `${prefix} · ${name}`;

  if (!page) {
    return (
      <span className={`text-xs text-gray-500 ${className}`}>
        {type}: {name}
      </span>
    );
  }

  return (
    <Link
      to={createPageUrl(page)}
      className={`inline-flex items-center gap-1 text-xs text-blue-600 hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
      title={`Open ${type} list`}
    >
      {showIcon && <Link2 className="w-3 h-3 shrink-0" />}
      <span className="truncate">{label}</span>
    </Link>
  );
}
