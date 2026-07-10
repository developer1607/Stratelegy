import { config } from '../server/config.js';
import { listDomains } from '../server/services/skyswitch/pbx.js';
import { pbxRequest, nodeList } from '../server/services/pbx/client.js';
import { getDomainRecord } from '../server/services/pbx/e911.js';
import { getDomainCallLimits } from '../server/services/pbx/vulnerability.js';
import { pbxIsConfigured } from '../server/services/pbx/auth.js';
import { skyswitchIsConfigured } from '../server/services/skyswitch/auth.js';

function summarizeKeys(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).sort();
}

function pickUseful(row) {
  if (!row) return null;
  const interesting = [
    'domain',
    'territory',
    'description',
    'policies',
    'time_zone',
    'email_sender',
    'call_limit',
    'call_limit_ext',
    'sub_limit',
    'max_call_queue',
    'max_aa',
    'max_conference',
    'max_department',
    'max_user',
    'max_device',
    'active_call',
    'countForLimit',
    'countExternal',
    'sub_count',
    'dial_plan',
    'dial_policy',
    'callid_nmbr',
    'callid_name',
    'callid_emgr',
    'area_code',
    'language',
    'moh',
    'mor',
    'rmoh',
    'resi',
    'vmail_provisioned',
    'vmail_transcribe',
    'current_user',
    'current_aa',
    'current_queue',
    'current_phonenumbers',
    'current_tollfree',
    'active_calls_onnet_current',
    'active_calls_offnet_current',
  ];
  const out = {};
  for (const k of interesting) {
    if (row[k] != null && row[k] !== '') out[k] = row[k];
  }
  for (const [k, v] of Object.entries(row)) {
    if (out[k] != null) continue;
    if (v == null || v === '') continue;
    if (typeof v === 'object') continue;
    out[k] = v;
  }
  return out;
}

const report = {
  skyswitch_configured: skyswitchIsConfigured(),
  pbx_configured: pbxIsConfigured(),
  skyswitch_account_set: Boolean(config.skyswitch.accountId),
  pbx_api_url_set: Boolean(config.pbx.apiBaseUrl),
};

try {
  const domains = await listDomains();
  report.telco_list_domains = {
    ok: true,
    count: domains.length,
    sample_fields: summarizeKeys(domains[0] || {}),
    sample: domains.slice(0, 3).map((d) => ({
      domain: d.domain,
      description: d.description || null,
      reseller: d.reseller || null,
      extra_keys: Object.keys(d).filter(
        (k) => !['domain', 'description', 'reseller', 'name'].includes(k),
      ),
    })),
  };
} catch (e) {
  report.telco_list_domains = { ok: false, error: e.message, status: e.status };
}

const sampleDomain =
  report.telco_list_domains?.sample?.[0]?.domain ||
  config.skyswitch.defaultDomain ||
  null;

report.probe_domain = sampleDomain;

if (sampleDomain && pbxIsConfigured()) {
  try {
    const xml = await pbxRequest('POST', '', {
      body: new URLSearchParams({
        object: 'domain',
        action: 'read',
        domain: sampleDomain,
      }),
    });
    const rows = nodeList(xml, 'domain');
    const row = rows[0] || null;
    report.pbx_domain_read = {
      ok: true,
      row_count: rows.length,
      all_keys: summarizeKeys(row),
      useful: pickUseful(row),
    };
  } catch (e) {
    report.pbx_domain_read = { ok: false, error: e.message, status: e.status };
  }

  try {
    const xml = await pbxRequest('POST', '', {
      body: new URLSearchParams({
        object: 'domain',
        action: 'read',
        billing: 'yes',
        domain: sampleDomain,
      }),
    });
    const rows = nodeList(xml, 'domain');
    const row = rows[0] || null;
    report.pbx_domain_billing = {
      ok: true,
      all_keys: summarizeKeys(row),
      useful: pickUseful(row),
    };
  } catch (e) {
    report.pbx_domain_billing = {
      ok: false,
      error: e.message,
      status: e.status,
    };
  }

  try {
    report.app_getDomainRecord = {
      ok: true,
      data: await getDomainRecord(sampleDomain),
    };
  } catch (e) {
    report.app_getDomainRecord = { ok: false, error: e.message };
  }

  try {
    report.app_getDomainCallLimits = {
      ok: true,
      data: await getDomainCallLimits(sampleDomain),
    };
  } catch (e) {
    report.app_getDomainCallLimits = { ok: false, error: e.message };
  }

  try {
    const data = await pbxRequest(
      'GET',
      `v2/domains/${encodeURIComponent(sampleDomain)}`,
      {
        contentType: null,
        parseAs: 'json',
      },
    );
    report.pbx_v2_get_domain = {
      ok: true,
      keys: summarizeKeys(data),
      sample:
        typeof data === 'object'
          ? Object.fromEntries(Object.entries(data).slice(0, 25))
          : data,
    };
  } catch (e) {
    report.pbx_v2_get_domain = {
      ok: false,
      error: e.message,
      status: e.status,
    };
  }

  try {
    const data = await pbxRequest('GET', 'v2/domains', {
      contentType: null,
      parseAs: 'json',
    });
    const list = Array.isArray(data)
      ? data
      : data?.domains || Object.values(data || {});
    report.pbx_v2_list_domains = {
      ok: true,
      count: Array.isArray(list) ? list.length : null,
      type: Array.isArray(data) ? 'array' : typeof data,
      sample_keys: summarizeKeys(Array.isArray(list) ? list[0] : data),
      sample: Array.isArray(list) ? list.slice(0, 2) : data,
    };
  } catch (e) {
    report.pbx_v2_list_domains = {
      ok: false,
      error: e.message,
      status: e.status,
    };
  }

  try {
    const territory = sampleDomain.match(/\.([0-9]+)\.service$/)?.[1];
    const xml = await pbxRequest('POST', '', {
      body: new URLSearchParams({
        object: 'domain',
        action: 'count',
        territory: territory || '',
      }),
    });
    report.pbx_domain_count = { ok: true, data: xml?.xml || xml };
  } catch (e) {
    report.pbx_domain_count = { ok: false, error: e.message, status: e.status };
  }
}

console.log(JSON.stringify(report, null, 2));
