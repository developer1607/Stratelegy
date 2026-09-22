import { getEndpointInventory } from './index.js';
import {
  resolveRecipientEmails,
  registerReportGenerator,
} from './reportSchedules.js';
import { buildReportTableHtml } from './reportEmailTable.js';
import { renderEmailTemplate } from '../email/templates/index.js';
import { sendRenderedEmail } from '../email/mailer.js';
import { publicAppBaseUrl } from '../../config.js';

function hostFromContact(contact) {
  const text = String(contact || '').trim();
  if (!text) return null;
  const at = text.match(/@([^:;>\s]+)/);
  if (at) return at[1];
  const ip = text.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);
  return ip ? ip[1] : null;
}

function extensionFromAor(aor) {
  const text = String(aor || '').trim();
  const m = text.match(/^(?:sip:)?([^@;>]+)/i);
  return m ? m[1] : null;
}

function normalizeIpHost(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const host = hostFromContact(text) || text.replace(/^\[|\]$/g, '');
  const noPort = host.replace(/:\d+$/, '');
  return noPort.toLowerCase() || null;
}

/**
 * Extensions where registration LAN/contact IP equals WAN / received_from IP.
 */
export async function collectSameInternalExternalIpRows(domain) {
  if (!domain) {
    const err = new Error('domain is required');
    err.status = 400;
    throw err;
  }
  const started = Date.now();
  const inventory = await getEndpointInventory(domain);
  const subscribers = inventory?.subscribers || [];
  const devices = inventory?.devices || [];

  const rows = [];
  const seen = new Set();

  const consider = (ext, name, wanRaw, lanRaw, mac) => {
    const wan = normalizeIpHost(wanRaw);
    const lan = normalizeIpHost(lanRaw);
    if (!wan || !lan || wan !== lan) return;
    const key = `${ext}|${wan}|${mac || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      domain,
      extension: ext || '—',
      name: name || '—',
      internal_ip: lan,
      external_ip: wan,
      mac_address: mac || '—',
    });
  };

  for (const sub of subscribers) {
    const lines = Array.isArray(sub.deviceLines) ? sub.deviceLines : [];
    for (const line of lines) {
      consider(
        line.line || sub.user || sub.extension,
        sub.name,
        line.wan_ip || line.received_from || sub.wan_ip,
        hostFromContact(line.contact) || line.lan_ip,
        line.mac_address,
      );
    }
    if (!lines.length) {
      consider(
        sub.user || sub.extension,
        sub.name,
        sub.wan_ip || sub.received_from,
        hostFromContact(sub.contact),
        sub.mac_address,
      );
    }
  }

  for (const device of devices) {
    const ext =
      device.subscriber_name ||
      extensionFromAor(device.aor || device.device) ||
      '';
    consider(
      ext,
      null,
      device.received_from || device.wan_ip,
      hostFromContact(device.contact),
      device.mac,
    );
  }

  return {
    domain,
    row_count: rows.length,
    rows,
    elapsed_ms: Date.now() - started,
  };
}

export async function runSipAlgSameIpReport(schedule, ctx = {}) {
  const domain = schedule?.domain;
  if (!domain) {
    return { status: 'error', message: 'sip_alg_same_ip schedules require a domain' };
  }

  const collection = await collectSameInternalExternalIpRows(domain);
  const emails = await resolveRecipientEmails(schedule.recipients);
  if (!emails.length) {
    return { status: 'error', message: 'No resolvable recipient emails', collection };
  }

  const generatedAt = new Date().toISOString();
  const tableHtml = buildReportTableHtml(
    ['Domain', 'Ext', 'Name', 'Internal IP', 'External IP', 'MAC'],
    collection.rows,
    (row) => [
      row.domain,
      row.extension,
      row.name,
      row.internal_ip,
      row.external_ip,
      row.mac_address,
    ],
  );

  const { subject, text, html } = await renderEmailTemplate('pbx_tabular_report', {
    title: 'SIP ALG — same internal/external IP',
    intro:
      'Extensions where the registration contact (internal) IP matches the WAN / received-from (external) IP.',
    generatedAt,
    domain,
    rowCount: collection.row_count,
    tableHtml,
    reportUrl: `${publicAppBaseUrl()}/PBXReports?tab=sip-alg`,
    ctaLabel: 'Open SIP ALG',
  });

  await sendRenderedEmail({
    to: emails.join(', '),
    subject,
    text,
    html,
    logLabel: 'pbx_sip_alg_same_ip',
  });

  return {
    status: 'sent',
    message: `Sent ${collection.row_count} same-IP row(s) for ${domain}`,
    recipients: emails.length,
    collection,
    force: Boolean(ctx.force),
  };
}

export async function runSipAlgSameIpImmediate({ domain, recipients } = {}) {
  return runSipAlgSameIpReport(
    { domain, recipients, options: {} },
    { force: true },
  );
}

registerReportGenerator('sip_alg_same_ip', runSipAlgSameIpReport);
