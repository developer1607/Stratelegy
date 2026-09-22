import { listDomains } from '../skyswitch/pbx.js';
import { listAllSubscribers } from './index.js';
import {
  resolveRecipientEmails,
  registerReportGenerator,
} from './reportSchedules.js';
import { buildReportTableHtml } from './reportEmailTable.js';
import { renderEmailTemplate } from '../email/templates/index.js';
import { sendRenderedEmail } from '../email/mailer.js';
import { publicAppBaseUrl } from '../../config.js';

const DEFAULT_CONCURRENCY = 3;

function isEmptyOrZeroCid(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '[*]' || text.includes('*')) return true;
  const digits = text.replace(/\D/g, '');
  if (!digits) return true;
  return /^0+$/.test(digits);
}

function domainName(row) {
  return row?.domain || row?.name || row?.id || null;
}

async function mapWithConcurrency(items, concurrency, fn) {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

export async function collectEmptyE911CidRows({
  domains: domainFilter = null,
  concurrency = DEFAULT_CONCURRENCY,
} = {}) {
  let names;
  if (Array.isArray(domainFilter) && domainFilter.length) {
    names = [...new Set(domainFilter.map((d) => String(d).trim()).filter(Boolean))];
  } else if (typeof domainFilter === 'string' && domainFilter.trim()) {
    names = [domainFilter.trim()];
  } else {
    const domains = await listDomains();
    names = [
      ...new Set(
        (Array.isArray(domains) ? domains : [])
          .map(domainName)
          .filter(Boolean)
          .map((d) => String(d)),
      ),
    ];
  }

  const started = Date.now();
  const perDomain = await mapWithConcurrency(names, concurrency, async (domain) => {
    try {
      const subscribers = await listAllSubscribers(domain);
      const rows = (subscribers || [])
        .filter((row) => isEmptyOrZeroCid(row.e911_caller_id ?? row.callid_emgr))
        .map((row) => ({
          domain,
          extension: row.user || row.extension,
          name: row.name,
          e911_caller_id: row.e911_caller_id || row.callid_emgr || '',
        }));
      return { domain, ok: true, rows };
    } catch (err) {
      return { domain, ok: false, rows: [], error: err?.message || String(err) };
    }
  });

  const rows = perDomain.flatMap((item) => item.rows);
  const errors = perDomain.filter((item) => !item.ok);
  return {
    domains_scanned: names.length,
    domains_failed: errors.length,
    row_count: rows.length,
    rows,
    elapsed_ms: Date.now() - started,
  };
}

export async function runE911EmptyCidReport(schedule, ctx = {}) {
  const domain = schedule?.domain || null;
  const collection = await collectEmptyE911CidRows({
    domains: domain || null,
  });

  const emails = await resolveRecipientEmails(schedule.recipients);
  if (!emails.length) {
    return { status: 'error', message: 'No resolvable recipient emails', collection };
  }

  const generatedAt = new Date().toISOString();
  const tableHtml = buildReportTableHtml(
    ['Domain', 'Ext', 'Name', 'PBX 911 CID'],
    collection.rows,
    (row) => [
      row.domain,
      row.extension,
      row.name,
      row.e911_caller_id || '(empty)',
    ],
  );

  const { subject, text, html } = await renderEmailTemplate('pbx_tabular_report', {
    title: 'E911 empty / zero CID',
    intro:
      'PBX users whose emergency caller ID (callid_emgr) is empty, wildcard, or all zeros.',
    generatedAt,
    domain: domain || undefined,
    domainsScanned: collection.domains_scanned,
    rowCount: collection.row_count,
    tableHtml,
    reportUrl: `${publicAppBaseUrl()}/PBXReports?tab=e911-review`,
    ctaLabel: 'Open E911 Review',
    extraRows: [['Domain scan errors', collection.domains_failed]],
  });

  await sendRenderedEmail({
    to: emails.join(', '),
    subject,
    text,
    html,
    logLabel: 'pbx_e911_empty_cid',
  });

  return {
    status: 'sent',
    message: `Sent ${collection.row_count} empty/zero 911 CID row(s) to ${emails.length} recipient(s)`,
    recipients: emails.length,
    collection,
    force: Boolean(ctx.force),
  };
}

export async function runE911EmptyCidImmediate({ domain = null, recipients } = {}) {
  return runE911EmptyCidReport(
    { domain: domain || null, recipients, options: {} },
    { force: true },
  );
}

registerReportGenerator('e911_empty_cid', runE911EmptyCidReport);
