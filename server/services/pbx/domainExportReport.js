import { config, publicAppBaseUrl } from '../../config.js';
import {
  listReportTypes,
  createReport,
  listReports,
  getReportFileDownload,
} from '../skyswitch/pbx.js';
import {
  resolveRecipientEmails,
  registerReportGenerator,
} from './reportSchedules.js';
import { renderEmailTemplate } from '../email/templates/index.js';
import { sendRenderedEmail } from '../email/mailer.js';

const POLL_INTERVAL_MS = 15_000;
const POLL_TIMEOUT_MS = 5 * 60_000;
const DEFAULT_REPORT_TYPE =
  process.env.SKYSWITCH_DOMAIN_EXPORT_REPORT_TYPE || '';

function flattenReportTypes(grouped) {
  if (!grouped || typeof grouped !== 'object') return [];
  const rows = [];
  for (const [category, items] of Object.entries(grouped)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item?.value) continue;
      rows.push({
        category,
        label: item.label || item.value,
        value: item.value,
        fields: item.fields || {},
      });
    }
  }
  return rows;
}

function fieldKeys(fields) {
  if (!fields) return [];
  if (Array.isArray(fields)) return fields.map(String);
  if (typeof fields === 'object') return Object.keys(fields);
  return [];
}

/** Pick SkySwitch async report type used for Domain Export. */
export async function resolveDomainExportReportType(preferred) {
  const wanted = String(
    preferred || DEFAULT_REPORT_TYPE || '',
  ).trim();
  const catalog = flattenReportTypes(await listReportTypes());
  if (!catalog.length) {
    const err = new Error('No SkySwitch report types available');
    err.status = 502;
    throw err;
  }

  if (wanted) {
    const exact = catalog.find((row) => row.value === wanted);
    if (exact) return exact;
  }

  const ranked = catalog
    .map((row) => {
      const label = `${row.label} ${row.value}`.toLowerCase();
      const keys = fieldKeys(row.fields).map((k) => k.toLowerCase());
      let score = 0;
      if (/domain.?export/.test(label)) score += 50;
      if (row.value === 'domain_export' || row.value === 'domain-export')
        score += 40;
      if (/\bdomain\b/.test(label) && keys.includes('domain')) score += 20;
      if (keys.includes('domain')) score += 5;
      if (/subscriber|user_device|extension/.test(label)) score += 2;
      return { row, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked[0]) return ranked[0].row;

  const withDomain = catalog.find((row) =>
    fieldKeys(row.fields).some((k) => k.toLowerCase() === 'domain'),
  );
  if (withDomain) return withDomain;

  const err = new Error(
    'Could not resolve a Domain Export report type. Set SKYSWITCH_DOMAIN_EXPORT_REPORT_TYPE in .env to a SkySwitch report_type key.',
  );
  err.status = 400;
  err.expose = true;
  throw err;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reportMatches(job, created) {
  if (!job || !created) return false;
  if (created.id != null && String(job.id) === String(created.id)) return true;
  if (
    created.report_type &&
    job.report_type === created.report_type &&
    created.created_at &&
    job.created_at === created.created_at
  ) {
    return true;
  }
  return false;
}

async function findReportJob(created) {
  const page = await listReports({ page: 1, perPage: 25 });
  const list = page?.data || page?.reports || [];
  return (Array.isArray(list) ? list : []).find((job) =>
    reportMatches(job, created),
  );
}

/**
 * Poll SkySwitch until the async report completes or times out (~5 min).
 */
export async function waitForReportCompletion(created, {
  timeoutMs = POLL_TIMEOUT_MS,
  intervalMs = POLL_INTERVAL_MS,
} = {}) {
  const deadline = Date.now() + timeoutMs;
  let latest = created;

  while (Date.now() < deadline) {
    const job = (await findReportJob(created)) || latest;
    latest = { ...created, ...job };
    const status = String(latest.status || '').toLowerCase();
    if (status === 'completed' || status === 'complete' || status === 'done') {
      return latest;
    }
    if (status === 'failed' || status === 'error' || status === 'cancelled') {
      const err = new Error(
        latest.error || `Domain Export failed (status: ${latest.status})`,
      );
      err.status = 502;
      err.expose = true;
      throw err;
    }
    await sleep(intervalMs);
  }

  const err = new Error(
    'Domain Export is still processing after 5 minutes. Check Completed exports and retry download there.',
  );
  err.status = 504;
  err.expose = true;
  err.report = latest;
  throw err;
}

async function resolveDownloadUrl(job) {
  const fileId = job?.file_id || job?.file?.id;
  if (!fileId) return null;
  const file = await getReportFileDownload(fileId);
  return file?.url || file?.download_url || null;
}

async function emailDomainExportLink({
  emails,
  domain,
  reportType,
  downloadUrl,
  job,
  scheduled,
}) {
  const { subject, text, html } = await renderEmailTemplate(
    'pbx_domain_export',
    {
      appName: config.appName,
      domain,
      reportType,
      downloadUrl,
      status: job?.status || 'completed',
      generatedAt: new Date().toISOString(),
      scheduled: Boolean(scheduled),
      reportsUrl: `${publicAppBaseUrl()}/PBXReports?tab=domain-export`,
    },
  );

  await sendRenderedEmail({
    to: emails.join(', '),
    subject,
    text,
    html,
    logLabel: 'pbx_domain_export',
  });
}

/**
 * Queue Domain Export for one domain, optionally poll until ready, email download link.
 */
export async function runDomainExportJob({
  domain,
  recipients,
  reportType: preferredType,
  scheduled = false,
  waitForCompletion = true,
} = {}) {
  if (!domain) {
    const err = new Error('domain is required for Domain Export');
    err.status = 400;
    throw err;
  }

  const emails = await resolveRecipientEmails(recipients);
  if (!emails.length) {
    const err = new Error('Select at least one recipient');
    err.status = 400;
    throw err;
  }

  const reportTypeRow = await resolveDomainExportReportType(preferredType);
  const created = await createReport({
    reportType: reportTypeRow.value,
    parameters: { domain },
    notes: scheduled
      ? `Scheduled Domain Export for ${domain}`
      : `Immediate Domain Export for ${domain}`,
  });

  if (!waitForCompletion) {
    // Finish poll + email off the request path (SkySwitch is async; ~5 min).
    setTimeout(() => {
      finalizeDomainExportEmail({
        created,
        domain,
        emails,
        reportType: reportTypeRow.value,
        scheduled,
      }).catch((err) => {
        console.error(
          `[pbx-domain-export] background finalize failed for ${domain}:`,
          err?.message || err,
        );
      });
    }, 0);

    return {
      status: 'queued',
      message: `Queued Domain Export for ${domain}. Recipients will be emailed when the file is ready (typically within ~5 minutes).`,
      report: created,
      report_type: reportTypeRow.value,
      domain,
      recipients: emails.length,
    };
  }

  return finalizeDomainExportEmail({
    created,
    domain,
    emails,
    reportType: reportTypeRow.value,
    scheduled,
  });
}

async function finalizeDomainExportEmail({
  created,
  domain,
  emails,
  reportType,
  scheduled,
}) {
  let completed;
  try {
    completed = await waitForReportCompletion(created);
  } catch (err) {
    if (err.status === 504) {
      await emailDomainExportLink({
        emails,
        domain,
        reportType,
        downloadUrl: null,
        job: err.report || created,
        scheduled,
      });
      return {
        status: 'queued',
        message: err.message,
        report: err.report || created,
        report_type: reportType,
        domain,
        recipients: emails.length,
      };
    }
    throw err;
  }

  const downloadUrl = await resolveDownloadUrl(completed);
  await emailDomainExportLink({
    emails,
    domain,
    reportType,
    downloadUrl,
    job: completed,
    scheduled,
  });

  return {
    status: 'sent',
    message: downloadUrl
      ? `Emailed Domain Export download link for ${domain}`
      : `Domain Export completed for ${domain}; open Reports to download`,
    report: completed,
    report_type: reportType,
    domain,
    download_url: downloadUrl,
    recipients: emails.length,
  };
}

export async function runDomainExportDailyReport(schedule, ctx = {}) {
  const domain = schedule?.domain;
  if (!domain) {
    return {
      status: 'error',
      message: 'domain_export schedules require a domain',
    };
  }
  const options = schedule.options || {};
  const result = await runDomainExportJob({
    domain,
    recipients: schedule.recipients,
    reportType: options.report_type || options.reportType,
    scheduled: true,
    waitForCompletion: true,
  });
  return {
    ...result,
    force: Boolean(ctx.force),
  };
}

registerReportGenerator('domain_export', runDomainExportDailyReport);
