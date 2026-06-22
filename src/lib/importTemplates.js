/** CSV import templates — shared by Settings downloads and import dialogs. */

export const IMPORT_TEMPLATES = {
  contacts: {
    filename: 'contacts_template.csv',
    headers: ['name', 'email', 'phone', 'company', 'position', 'source'],
    sampleRow: [
      'John Doe',
      'john@example.com',
      '+1234567890',
      'Acme Inc',
      'Sales Manager',
      'Email',
    ],
  },
  accounts: {
    filename: 'accounts_template.csv',
    headers: [
      'name',
      'industry',
      'website',
      'phone',
      'email',
      'annual_revenue',
      'employees',
      'status',
      'tier',
    ],
    sampleRow: [
      'Acme Inc',
      'Technology',
      'https://acme.com',
      '+1234567890',
      'info@acme.com',
      '1000000',
      '50',
      'active',
      'Standard',
    ],
  },
  leads: {
    filename: 'leads_template.csv',
    headers: ['name', 'email', 'phone', 'company', 'status', 'source', 'value'],
    sampleRow: [
      'Jane Smith',
      'jane@example.com',
      '+1234567890',
      'Beta Corp',
      'New',
      'Website',
      '50000',
    ],
  },
};

function escapeCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function buildImportTemplateCsv(type) {
  const template = IMPORT_TEMPLATES[type];
  if (!template) return '';
  return [
    template.headers.join(','),
    template.sampleRow.map(escapeCsvCell).join(','),
  ].join('\n');
}

export function downloadImportTemplate(type) {
  const template = IMPORT_TEMPLATES[type];
  if (!template) return;
  const csv = buildImportTemplateCsv(type);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = template.filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
