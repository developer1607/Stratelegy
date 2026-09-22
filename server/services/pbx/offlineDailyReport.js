import { listDomains } from '../skyswitch/pbx.js';
import { getOfflineExtensionOverview } from './index.js';
import {
  resolveRecipientEmails,
  registerReportGenerator,
} from './reportSchedules.js';
import { renderEmailTemplate } from '../email/templates/index.js';
import { sendRenderedEmail } from '../email/mailer.js';
import { config } from '../../config.js';

const DEFAULT_CONCURRENCY = 3;
const MIN_DOWNTIME_SECONDS = {
  any: 0,
  '15m': 15 * 60,
  '1h': 60 * 60,
  '4h': 4 * 60 * 60,
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
};

export const OFFLINE_MIN_DOWNTIME_OPTIONS = Object.keys(MIN_DOWNTIME_SECONDS);

/** Parse strings like "2d 3h 15m 10s" or "1h 5m" into seconds. */
export function parseDowntimeToSeconds(value) {
  if (value == null || value === '' || value === '—') return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  const text = String(value).trim().toLowerCase();
  if (!text) return 0;
  let total = 0;
  const re = /(\d+)\s*(d|h|m|s)\b/g;
  let match;
  let found = false;
  while ((match = re.exec(text))) {
    found = true;
    const n = Number(match[1]);
    if (match[2] === 'd') total += n * 86400;
    else if (match[2] === 'h') total += n * 3600;
    else if (match[2] === 'm') total += n * 60;
    else total += n;
  }
  if (found) return total;
  const asNum = Number(text);
  return Number.isFinite(asNum) ? Math.max(0, Math.floor(asNum)) : 0;
}

function minDowntimeSeconds(options = {}) {
  const key = String(options.min_downtime || options.minDowntime || 'any');
  return MIN_DOWNTIME_SECONDS[key] ?? 0;
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

function domainName(row) {
  return row?.domain || row?.name || row?.id || null;
}

/**
 * Aggregate offline extensions across reseller domains (concurrency-limited).
 * Pass `domains` to limit to specific domain names.
 */
export async function collectOfflineEndpointsAcrossDomains({
  minDowntime = 'any',
  concurrency = DEFAULT_CONCURRENCY,
  domains: domainFilter = null,
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

  const minSeconds = minDowntimeSeconds({ min_downtime: minDowntime });
  const started = Date.now();
  const perDomain = await mapWithConcurrency(
    names,
    concurrency,
    async (domain) => {
      try {
        const overview = await getOfflineExtensionOverview(domain, {
          allowDomainListFallback: false,
        });
        const rows = (overview?.extensionOffline || [])
          .filter(
            (row) => parseDowntimeToSeconds(row.downtime) >= minSeconds,
          )
          .map((row) => ({
            domain,
            extension: row.extension,
            name: row.name,
            mac_address: row.mac_address,
            site: row.site,
            downtime: row.downtime,
            notes: row.notes,
            caller_id: row.caller_id,
          }));
        return { domain, ok: true, rows, error: null };
      } catch (err) {
        return {
          domain,
          ok: false,
          rows: [],
          error: err?.message || String(err),
        };
      }
    },
  );

  const rows = perDomain.flatMap((item) => item.rows);
  const errors = perDomain.filter((item) => !item.ok);
  return {
    domains_scanned: names.length,
    domains_failed: errors.length,
    domain_errors: errors.slice(0, 20),
    row_count: rows.length,
    rows,
    min_downtime: minDowntime,
    elapsed_ms: Date.now() - started,
  };
}

function buildOfflineTableHtml(rows) {
  if (!rows.length) {
    return '<p style="margin:0;">No offline endpoints matched the downtime filter.</p>';
  }
  const header = `
    <tr>
      <th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;">Domain</th>
      <th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;">Ext</th>
      <th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;">Name</th>
      <th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;">MAC</th>
      <th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;">Downtime</th>
      <th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;">Site</th>
    </tr>`;
  const body = rows
    .slice(0, 500)
    .map((row) => {
      const cells = [
        row.domain,
        row.extension,
        row.name,
        row.mac_address,
        row.downtime,
        row.site,
      ]
        .map((value) => {
          const text = String(value ?? '—')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return `<td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:13px;">${text}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  const truncated =
    rows.length > 500
      ? `<p style="margin:12px 0 0;color:#64748b;font-size:13px;">Showing first 500 of ${rows.length} rows.</p>`
      : '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${header}${body}</table>${truncated}`;
}

function buildOfflineText(rows, summary) {
  const lines = [
    `Offline Endpoint daily report — ${config.appName}`,
    `Domains scanned: ${summary.domains_scanned}`,
    `Offline matching filter: ${summary.row_count}`,
    `Min downtime: ${summary.min_downtime}`,
    '',
  ];
  for (const row of rows.slice(0, 200)) {
    lines.push(
      `${row.domain} | ${row.extension || '—'} | ${row.name || '—'} | ${row.downtime || '—'}`,
    );
  }
  if (rows.length > 200) lines.push(`…and ${rows.length - 200} more`);
  return lines.join('\n');
}

export async function runOfflineEndpointDailyReport(schedule, ctx = {}) {
  const options = schedule?.options || {};
  const minDowntime = String(options.min_downtime || options.minDowntime || 'any');
  const sendIfEmpty = Boolean(
    options.send_if_empty ?? options.sendIfEmpty ?? false,
  );
  const concurrency = Number(options.concurrency) || DEFAULT_CONCURRENCY;
  const domain = schedule?.domain || null;

  const collection = await collectOfflineEndpointsAcrossDomains({
    minDowntime,
    concurrency,
    domains: domain || null,
  });

  if (!collection.row_count && !sendIfEmpty) {
    return {
      skipped: true,
      status: 'skipped',
      message: `No offline endpoints (min downtime ${minDowntime}); send suppressed`,
      collection,
    };
  }

  const emails = await resolveRecipientEmails(schedule.recipients);
  if (!emails.length) {
    return {
      status: 'error',
      message: 'No resolvable recipient emails',
      collection,
    };
  }

  const generatedAt = new Date().toISOString();
  const { subject, text, html } = await renderEmailTemplate('pbx_offline_daily', {
    appName: config.appName,
    generatedAt,
    domainsScanned: collection.domains_scanned,
    domainsFailed: collection.domains_failed,
    rowCount: collection.row_count,
    minDowntime,
    elapsedMs: collection.elapsed_ms,
    tableHtml: buildOfflineTableHtml(collection.rows),
    textBody: buildOfflineText(collection.rows, collection),
    reportUrl: `${config.appBaseUrl}/PBXReports?tab=offline-endpoint`,
  });

  await sendRenderedEmail({
    to: emails.join(', '),
    subject,
    text,
    html,
    logLabel: 'pbx_offline_daily',
  });

  const failNote =
    collection.domains_failed > 0
      ? ` (${collection.domains_failed} domain scan error(s))`
      : '';
  return {
    status: 'sent',
    message: `Sent ${collection.row_count} offline row(s) to ${emails.length} recipient(s)${failNote}`,
    recipients: emails.length,
    collection,
    force: Boolean(ctx.force),
  };
}

/** Immediate one-shot offline report (optionally for one domain). */
export async function runOfflineEndpointImmediate({
  domain = null,
  recipients,
  minDowntime = 'any',
  sendIfEmpty = false,
} = {}) {
  return runOfflineEndpointDailyReport(
    {
      domain: domain || null,
      recipients,
      options: {
        min_downtime: minDowntime,
        send_if_empty: sendIfEmpty,
      },
    },
    { force: true },
  );
}

registerReportGenerator('offline_endpoint', runOfflineEndpointDailyReport);
