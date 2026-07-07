import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { attachPermissions } from '../middleware/permissions.js';
import { requireAnyPbxPermission, requirePbxPermission, blockPbxDomainScopedWrite } from '../middleware/pbxAccess.js';
import * as pbx from '../services/skyswitch/pbx.js';
import {
  SKYSWITCH_API_REGISTRY,
  SKYSWITCH_OUT_OF_SCOPE,
} from '../services/skyswitch/apiRegistry.js';
import {
  getSkySwitchScopeStatus,
  scopeErrBody,
} from '../services/skyswitch/scopes.js';
import {
  domainListFallbackAllowed,
} from '../../shared/pbxDataAccess.js';
import {
  assertDomainAllowed,
  filterDomainsForUser,
  resolveAllowedPbxDomain,
  isPbxDomainRestricted,
  getAssignedPbxDomains,
} from '../../shared/pbxDomainAccess.js';
import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';
import * as hybridPbx from '../services/pbx/index.js';

const router = Router();

function pbxDomainOpts(req) {
  if (req.user?.role === 'admin') return { allowDomainListFallback: true };
  const perms = req.permissions || {};
  if (perms.isAdmin || perms.can_access_pbx) return { allowDomainListFallback: true };
  if (isPbxDomainRestricted(perms) && getAssignedPbxDomains(perms).length) {
    return { allowDomainListFallback: true };
  }
  return { allowDomainListFallback: domainListFallbackAllowed(perms) };
}

async function domainFromRequest(req) {
  const perms = req.permissions || {};
  const fallback = getAssignedPbxDomains(perms)[0] || null;
  const requested = req.query.domain || null;
  const allowed = resolveAllowedPbxDomain(perms, requested, fallback);
  const resolved = await pbx.resolveDomain(allowed, pbxDomainOpts(req));
  if (resolved) assertDomainAllowed(perms, resolved);
  return resolved;
}

async function requireDomainFromRequest(req) {
  const domain = await domainFromRequest(req);
  if (!domain && isPbxDomainRestricted(req.permissions)) {
    const err = new Error('Select an assigned PBX domain to view this data');
    err.status = 403;
    throw err;
  }
  return domain;
}

function normalizeJournalIdentifier(value) {
  if (value == null || value === '') return undefined;
  const text = String(value).trim();
  const territory = text.split('.').find((part) => /^\d{4,}$/.test(part));
  return territory || text;
}

async function journalIdentifierFromRequest(req) {
  if (isPbxDomainRestricted(req.permissions)) {
    return normalizeJournalIdentifier(await requireDomainFromRequest(req));
  }
  const raw = req.query.identifier || req.query.domain || (await domainFromRequest(req));
  return normalizeJournalIdentifier(raw);
}

async function assertPhoneInAssignedDomain(req, phoneNumber) {
  if (!isPbxDomainRestricted(req.permissions)) return;
  const domain = await requireDomainFromRequest(req);
  const numbers = await pbx.listPbxPhoneNumbers(domain);
  const target = String(phoneNumber).replace(/\D/g, '');
  const allowed = (Array.isArray(numbers) ? numbers : []).some((item) => {
    const value = String(item.phone_number || item.number || item.did || '').replace(/\D/g, '');
    return value === target || value.endsWith(target.slice(-10));
  });
  if (!allowed) {
    const err = new Error('Phone number is not in your assigned domain');
    err.status = 403;
    throw err;
  }
}

function denyDomainScopedAccountWide(req, res) {
  if (!isPbxDomainRestricted(req.permissions)) return false;
  res.status(403).json({
    error: 'Account-wide PBX logs and reports are not available for domain-scoped users',
    code: 'pbx_domain_scope_required',
  });
  return true;
}

const requireViewReports = requireAnyPbxPermission(
  'can_view_pbx_reports_page',
  'can_view_e911_reports'
);

function scopeErr(err, feature, res, next) {
  const mapped = scopeErrBody(err, feature);
  if (mapped) return res.status(mapped.status).json(mapped.body);
  return next(err);
}

router.use(
  requireAuth,
  attachPermissions,
  requireAnyPbxPermission(
    'can_view_pbx_dashboard',
    'can_view_endpoint_control',
    'can_view_offline_endpoints',
    'can_view_sip_alg',
    'can_view_troubleshooting',
    'can_view_e911_review',
    'can_view_e911_reports',
    'can_view_pbx_reports_page',
    'can_view_mos_scores_page',
    'can_view_sip_trunks',
    'can_view_extensions_page',
    'can_view_call_logs_page',
    'can_view_call_routing_page',
    'can_view_phone_numbers_page',
    'can_view_voicemail_page',
    'can_view_route_by_ani_page',
    'can_view_pbx_domains_page',
    'can_manage_pbx_reports',
    'can_access_pbx',
    'can_manage_pbx_routing',
    'can_manage_route_by_ani',
    'can_manage_e911',
    'can_manage_pbx_endpoints',
    'can_access_pbx_domain_scoped'
  )
);

router.use(async (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  return blockPbxDomainScopedWrite(req, res, next);
});

router.get('/status', requirePbxPermission('can_view_pbx_dashboard'), async (_req, res, next) => {
  try {
    res.json(await pbx.getPbxStatus());
  } catch (err) {
    next(err);
  }
});

router.get(
  '/hybrid/status',
  requirePbxPermission('can_view_pbx_dashboard'),
  async (_req, res, next) => {
    try {
      res.json(await hybridPbx.getPbxApiStatus());
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/cdrs',
  requirePbxPermission('can_view_call_logs_page'),
  async (req, res, next) => {
    try {
      const domain = isPbxDomainRestricted(req.permissions)
        ? await requireDomainFromRequest(req)
        : await domainFromRequest(req);
      const start = req.query.start_date || new Date(Date.now() - 86400000).toISOString().slice(0, 19).replace('T', ' ');
      const end = req.query.end_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const data = await hybridPbx.listCdrs({
        startDate: start,
        endDate: end,
        domain,
        user: req.query.user,
        type: req.query.type,
        raw: req.query.raw,
        qos: req.query.qos,
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.per_page) || 50,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/cdrs/export',
  requirePbxPermission('can_view_call_logs_page'),
  async (req, res, next) => {
    try {
      const domain = isPbxDomainRestricted(req.permissions)
        ? await requireDomainFromRequest(req)
        : await domainFromRequest(req);
      const start = req.query.start_date || new Date(Date.now() - 86400000).toISOString().slice(0, 19).replace('T', ' ');
      const end = req.query.end_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const data = await hybridPbx.listCdrs({
        startDate: start,
        endDate: end,
        domain,
        user: req.query.user,
        type: req.query.type,
        raw: req.query.raw,
        qos: req.query.qos,
        page: Number(req.query.page) || 1,
        perPage: Math.min(Number(req.query.per_page) || 250, 1000),
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="pbx-cdrs-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(hybridPbx.cdrRowsToCsv(data.rows));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/phones',
  requireAnyPbxPermission('can_view_endpoint_control', 'can_access_pbx'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      if (!domain) return res.json([]);
      res.json(await hybridPbx.listPhones(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/phones',
  requirePbxPermission('can_manage_pbx_endpoints'),
  blockPbxDomainScopedWrite,
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.status(201).json(await hybridPbx.createPhone(domain, req.body || {}));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/phones/:macAddress',
  requireAnyPbxPermission('can_view_endpoint_control', 'can_access_pbx'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      if (!domain) return res.json(null);
      res.json(await hybridPbx.getPhone(domain, req.params.macAddress));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/phones/:macAddress/resync',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      if (!domain) {
        const err = new Error('domain is required');
        err.status = 400;
        err.expose = true;
        throw err;
      }
      const phone = await hybridPbx.getPhone(domain, req.params.macAddress);
      if (!phone?.primary_device) {
        const err = new Error('No primary PBX device found for this phone');
        err.status = 404;
        err.expose = true;
        throw err;
      }
      await hybridPbx.resyncPhone(phone.primary_device);
      res.status(202).json({ ok: true, device: phone.primary_device });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/phones/:macAddress/overrides',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const { overrides } = req.body || {};
      if (overrides == null) {
        const err = new Error('overrides is required');
        err.status = 400;
        err.expose = true;
        throw err;
      }
      const phone = await hybridPbx.updatePhone(domain, req.params.macAddress, { overrides });
      res.json(phone);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/phones/:macAddress',
  requirePbxPermission('can_manage_pbx_endpoints'),
  blockPbxDomainScopedWrite,
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.deletePhoneRecord(domain, req.params.macAddress));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/domains',
  requireAnyPbxPermission('can_view_pbx_domains_page', 'can_access_pbx_domain_scoped'),
  async (req, res, next) => {
    try {
      const all = await pbx.listDomains();
      res.json(filterDomainsForUser(req.permissions, all));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/resellers',
  requirePbxPermission('can_view_pbx_domains_page'),
  async (_req, res, next) => {
    try {
      res.json(await pbx.listResellers());
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/api-catalog',
  requireAnyPbxPermission('can_view_pbx_dashboard', 'can_access_pbx'),
  (_req, res) => {
    res.json({ implemented: SKYSWITCH_API_REGISTRY, outOfScope: SKYSWITCH_OUT_OF_SCOPE });
  }
);

router.get('/dashboard', requirePbxPermission('can_view_pbx_dashboard'), async (req, res, next) => {
  try {
    res.json(await pbx.getDashboardSummary(null, req.permissions, pbxDomainOpts(req)));
  } catch (err) {
    next(err);
  }
});

router.get(
  '/endpoint-control/overview',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await hybridPbx.getEndpointInventory(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/endpoint-control/subscribers',
  requirePbxPermission('can_manage_pbx_endpoints'),
  blockPbxDomainScopedWrite,
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.status(201).json(await hybridPbx.createEndpoint(domain, req.body || {}));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/endpoint-control/subscribers/:user',
  requirePbxPermission('can_manage_pbx_endpoints'),
  blockPbxDomainScopedWrite,
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const deletePhone = req.query.delete_phone !== 'false';
      res.json(await hybridPbx.deleteEndpoint(domain, req.params.user, { deletePhone }));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/endpoint-control/subscribers/:user/detail',
  requireAnyPbxPermission('can_view_endpoint_control', 'can_view_extensions_page'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.getEndpointDetail(domain, req.params.user));
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/endpoint-control/subscribers/:user',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const { email, department, notes, dial_policy, dial_plan, time_zone, site, vm_pin, e911_caller_id } = req.body || {};
      res.json(
        await hybridPbx.updateSubscriber(domain, req.params.user, {
          email,
          department,
          notes,
          dial_policy,
          dial_plan,
          time_zone,
          site,
          vm_pin,
          e911_caller_id,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/endpoint-control/subscribers/:user/e911-caller-id',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const { e911_caller_id } = req.body || {};
      res.json(
        await hybridPbx.updateSubscriberE911CallerId(domain, req.params.user, e911_caller_id)
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/endpoint-control/sites',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.listSites(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/endpoint-control/subscribers/:user/voicemails',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.getSubscriberVoicemail(domain, req.params.user));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/endpoint-control/subscribers/:user/monitoring',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.getSubscriberMonitoring(domain, req.params.user));
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/endpoint-control/subscribers/:user/monitoring',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(
        await hybridPbx.setSubscriberMonitoring(domain, req.params.user, Boolean(req.body?.enabled))
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/endpoint-control/subscribers/:user/groups',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.getSubscriberGroups(domain, req.params.user));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/e911/review-overview',
  requirePbxPermission('can_view_e911_review'),
  async (req, res, next) => {
    try {
      const domain = isPbxDomainRestricted(req.permissions)
        ? await requireDomainFromRequest(req)
        : await domainFromRequest(req);
      res.json(await hybridPbx.getE911ReviewOverview(domain, pbxDomainOpts(req)));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/e911/domain-defaults',
  requirePbxPermission('can_view_e911_review'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.getDomainRecord(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/e911/domain-defaults',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const { e911_caller_id, caller_id, caller_id_name } = req.body || {};
      res.json(
        await hybridPbx.updateDomainE911Defaults(domain, {
          e911_caller_id,
          caller_id,
          caller_id_name,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/e911/emergency-pool',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const { callid, tag } = req.body || {};
      const pool = await hybridPbx.createEmergencyPoolNumber(domain, callid, tag);
      res.status(201).json({ pool });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/e911/emergency-pool/:callid',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const pool = await hybridPbx.updateEmergencyPoolNumber(
        domain,
        req.params.callid,
        req.body?.tag
      );
      res.json({ pool });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/e911/emergency-pool/:callid',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const pool = await hybridPbx.deleteEmergencyPoolNumber(domain, req.params.callid);
      res.json({ pool });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/e911/subscribers/:user/profile',
  requirePbxPermission('can_view_e911_review'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      res.json(await hybridPbx.getSubscriberE911Profile(domain, req.params.user));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/offline-endpoints/overview',
  requirePbxPermission('can_view_offline_endpoints'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await hybridPbx.getOfflineExtensionOverview(domain, pbxDomainOpts(req)));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/mos-scores',
  requirePbxPermission('can_view_mos_scores_page'),
  async (req, res, next) => {
    try {
      const identifier = await journalIdentifierFromRequest(req);
      res.json(
        await pbx.getMosScores({
          startDate: req.query.start_date,
          endDate: req.query.end_date,
          page: Number(req.query.page) || 1,
          perPage: Number(req.query.per_page) || 50,
          module: req.query.module,
          type: req.query.type,
          identifier,
        })
      );
    } catch (err) {
      return scopeErr(err, 'log', res, next);
    }
  }
);

router.get(
  '/subscribers',
  requireAnyPbxPermission('can_view_endpoint_control', 'can_access_pbx'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.listSubscribers(domain, req.query.filter || 'subscriber'));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/extensions',
  requirePbxPermission('can_view_extensions_page'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      if (!domain) return res.json([]);
      const telcoSubs = await pbx.listSubscribers(domain, 'subscriber');
      const inventory = await hybridPbx.getEndpointInventory(domain).catch(() => ({ subscribers: [] }));
      const byUser = new Map(
        (inventory.subscribers || []).map((row) => [String(row.user || '').toLowerCase(), row])
      );
      res.json(
        telcoSubs.map((row) => {
          const enriched = byUser.get(String(row.user || '').toLowerCase());
          if (!enriched) {
            return { ...row, online_status: 'no_device' };
          }
          return {
            ...row,
            online_status: enriched.online_status,
            mac_address: enriched.mac_address,
            model: enriched.model,
            transport: enriched.transport,
            site: enriched.site || row.site,
            department: enriched.department || row.department || row.group,
            notes: enriched.notes || row.notes,
            wan_ip: enriched.wan_ip || row.wan_ip,
          };
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/messaging-users',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.listMessagingUsers(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/messaging/aliases/pbxuser',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const { user, service, uri } = req.query;
      if (!user) {
        return res.status(400).json({ error: 'user query parameter is required' });
      }
      const domain = await domainFromRequest(req);
      res.json(await pbx.getPbxUserPhoneNumbers(domain, user, { service, uri }));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/endpoints',
  requirePbxPermission('can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      const [subscribers, messagingUsers] = await Promise.all([
        pbx.listSubscribers(domain, req.query.filter || 'subscriber'),
        pbx.listMessagingUsers(domain),
      ]);
      res.json({ subscribers, messagingUsers });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/offline-endpoints',
  requirePbxPermission('can_view_offline_endpoints'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.getOfflineEndpoints(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/e911',
  requirePbxPermission('can_view_e911_review'),
  async (req, res, next) => {
    try {
      if (isPbxDomainRestricted(req.permissions)) {
        const domain = await requireDomainFromRequest(req);
        const overview = await hybridPbx.getE911ReviewOverview(domain, pbxDomainOpts(req));
        res.json(overview.provisioned);
        return;
      }
      res.json(await pbx.listE911Endpoints());
    } catch (err) {
      next(err);
    }
  }
);

router.get('/e911/countries', requirePbxPermission('can_manage_e911'), async (_req, res, next) => {
  try {
    res.json(await pbx.listE911Countries());
  } catch (err) {
    next(err);
  }
});

router.get('/e911/states', requirePbxPermission('can_manage_e911'), async (_req, res, next) => {
  try {
    res.json(await pbx.listE911States());
  } catch (err) {
    next(err);
  }
});

router.get(
  '/e911/validate/address',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      res.json(await pbx.validateE911Address(req.query));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/e911/:phoneNumber(\\d{11})',
  requirePbxPermission('can_view_e911_review'),
  async (req, res, next) => {
    try {
      await assertPhoneInAssignedDomain(req, req.params.phoneNumber);
      res.json(await pbx.getE911ForPhone(req.params.phoneNumber));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/trunk-groups',
  requirePbxPermission('can_view_sip_trunks'),
  async (req, res, next) => {
    try {
      const domain = isPbxDomainRestricted(req.permissions)
        ? await requireDomainFromRequest(req)
        : req.query.domain
          ? await domainFromRequest(req)
          : null;
      res.json(await pbx.listTrunkGroups(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get('/sip-alg', requirePbxPermission('can_view_sip_alg'), async (req, res, next) => {
  try {
    const domain = await domainFromRequest(req);
    res.json(await pbx.getSipAlgSettings(domain));
  } catch (err) {
    next(err);
  }
});

router.get(
  '/troubleshooting/vulnerability',
  requirePbxPermission('can_view_troubleshooting'),
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const { dial_policy, highlighted, show_voicemail_pin, voicemail_enabled } = req.query;
      res.json(
        await hybridPbx.getVulnerabilityCheck(domain, {
          dial_policy,
          highlighted,
          show_voicemail_pin,
          voicemail_enabled,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/troubleshooting/vulnerability/call-limit',
  requirePbxPermission('can_manage_pbx_endpoints'),
  blockPbxDomainScopedWrite,
  async (req, res, next) => {
    try {
      const domain = await requireDomainFromRequest(req);
      const callLimit = req.body?.call_limit;
      if (callLimit == null || callLimit === '') {
        const err = new Error('call_limit is required');
        err.status = 400;
        err.expose = true;
        throw err;
      }
      res.json(await hybridPbx.updateDomainCallLimit(domain, callLimit));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/call-routing',
  requirePbxPermission('can_view_call_routing_page'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.getCallRoutingOverview(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/routes/:phoneNumber',
  requirePbxPermission('can_view_call_routing_page'),
  async (req, res, next) => {
    try {
      await assertPhoneInAssignedDomain(req, req.params.phoneNumber);
      res.json(await pbx.getPhoneRoute(req.params.phoneNumber));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/route-by-ani',
  requireAnyPbxPermission('can_view_route_by_ani_page', 'can_manage_route_by_ani'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(
        await pbx.listRoutesByAni(domain, {
          ani: req.query.ani,
          dnis: req.query.dnis,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/voicemail',
  requirePbxPermission('can_view_voicemail_page'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.getVoicemailOverview(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/auto-attendants',
  requirePbxPermission('can_view_voicemail_page'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.listAutoAttendants(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/call-queues',
  requirePbxPermission('can_view_voicemail_page'),
  async (req, res, next) => {
    try {
      const domain = await domainFromRequest(req);
      res.json(await pbx.listCallQueues(domain));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/phone-numbers',
  requireAnyPbxPermission(
    'can_view_phone_numbers_page',
    'can_view_call_routing_page',
    'can_manage_pbx_routing'
  ),
  async (req, res, next) => {
    try {
      if (req.query.scope === 'inventory') {
        if (isPbxDomainRestricted(req.permissions)) {
          return res.status(403).json({
            error: 'Account-wide phone inventory is not available for domain-scoped users',
            code: 'pbx_domain_scope_required',
          });
        }
        res.json(await pbx.listInventoryPhoneNumbers());
      } else {
        const domain = await domainFromRequest(req);
        res.json(await pbx.listPbxPhoneNumbers(domain));
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/audit-logs/resource-actions',
  requirePbxPermission('can_view_call_logs_page'),
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      res.json(await pbx.listAuditActions());
    } catch (err) {
      return scopeErr(err, 'log', res, next);
    }
  }
);

router.get(
  '/journals/module-type-actions',
  requirePbxPermission('can_view_call_logs_page'),
  async (_req, res, next) => {
    try {
      res.json(await pbx.listJournalTypes());
    } catch (err) {
      return scopeErr(err, 'log', res, next);
    }
  }
);

router.get(
  '/journals',
  requirePbxPermission('can_view_call_logs_page'),
  async (req, res, next) => {
    try {
      const end = req.query.end_date || new Date().toISOString().slice(0, 10);
      const start =
        req.query.start_date || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const identifier = await journalIdentifierFromRequest(req);
      res.json(
        await pbx.listJournals({
          startDate: start,
          endDate: end,
          page: Number(req.query.page) || 1,
          perPage: Number(req.query.per_page) || 25,
          module: req.query.module,
          type: req.query.type,
          action: req.query.action,
          identifier,
        })
      );
    } catch (err) {
      return scopeErr(err, 'log', res, next);
    }
  }
);

router.get(
  '/audit-logs',
  requirePbxPermission('can_view_call_logs_page'),
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      const end = req.query.end_date || new Date().toISOString().slice(0, 10);
      const start =
        req.query.start_date || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      res.json(
        await pbx.listAuditLogs({
          startDate: start,
          endDate: end,
          page: Number(req.query.page) || 1,
        })
      );
    } catch (err) {
      return scopeErr(err, 'log', res, next);
    }
  }
);

router.get(
  '/reports/types',
  requireViewReports,
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      res.json(await pbx.listReportTypes());
    } catch (err) {
      return scopeErr(err, 'report', res, next);
    }
  }
);

router.get('/reports', requireViewReports, async (req, res, next) => {
  try {
    if (denyDomainScopedAccountWide(req, res)) return;
    res.json(
      await pbx.listReports({
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.per_page) || 25,
      })
    );
  } catch (err) {
    return scopeErr(err, 'report', res, next);
  }
});

router.post(
  '/reports',
  requirePbxPermission('can_manage_pbx_reports'),
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      const { report_type: reportType, parameters, notes } = req.body || {};
      const params =
        parameters == null
          ? []
          : Array.isArray(parameters)
            ? parameters
            : typeof parameters === 'object'
              ? parameters
              : [];
      res.status(201).json(
        await pbx.createReport({
          reportType,
          parameters: params,
          notes,
        })
      );
    } catch (err) {
      return scopeErr(err, 'report', res, next);
    }
  }
);

router.get('/scope-status', requireAdmin, (_req, res) => {
  res.json(getSkySwitchScopeStatus(config.skyswitch.scope));
});

router.get(
  '/reports/files/:fileId/download',
  requireViewReports,
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      res.json(await pbx.getReportFileDownload(req.params.fileId));
    } catch (err) {
      return scopeErr(err, 'report', res, next);
    }
  }
);

router.delete(
  '/reports/:reportId',
  requirePbxPermission('can_manage_pbx_reports'),
  async (req, res, next) => {
    try {
      await pbx.cancelReport(req.params.reportId);
      res.status(204).send();
    } catch (err) {
      return scopeErr(err, 'report', res, next);
    }
  }
);

router.get(
  '/ui-config',
  requirePbxPermission('can_view_sip_alg'),
  async (req, res, next) => {
    try {
      const { config_name: configName } = req.query;
      if (!configName) return res.status(400).json({ message: 'config_name is required' });
      const domain = await domainFromRequest(req);
      res.json(await pbx.getUiConfig(domain, configName));
    } catch (err) {
      next(err);
    }
  }
);

// ── Write routes ──

router.put(
  '/routes/:phoneNumber',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.setPhoneRoute(req.params.phoneNumber, req.body));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/routes/:phoneNumber',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.deletePhoneRoute(req.params.phoneNumber));
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/e911/:phoneNumber(\\d{11})',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      res.json(await pbx.provisionE911(req.params.phoneNumber, req.body));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/e911/:phoneNumber(\\d{11})',
  requirePbxPermission('can_manage_e911'),
  async (req, res, next) => {
    try {
      res.json(await pbx.unprovisionE911(req.params.phoneNumber));
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/route-by-ani',
  requirePbxPermission('can_manage_route_by_ani'),
  async (req, res, next) => {
    try {
      res.json(await pbx.provisionRouteByAni(req.query));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/route-by-ani',
  requirePbxPermission('can_manage_route_by_ani'),
  async (req, res, next) => {
    try {
      res.json(await pbx.deleteRouteByAni(req.query));
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/messaging/hubusers',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      res.json(await pbx.provisionHubUser(req.body));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/messaging/hubusers/:userId',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      res.json(await pbx.unprovisionHubUser(req.params.userId));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/fax-atas',
  requirePbxPermission('can_view_offline_endpoints'),
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      res.json(await pbx.listFaxAtas());
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/fax-atas/:macAddress/status',
  requirePbxPermission('can_view_offline_endpoints'),
  async (req, res, next) => {
    try {
      if (denyDomainScopedAccountWide(req, res)) return;
      res.json(await pbx.getFaxAtaStatus(req.params.macAddress));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/fax-atas/:macAddress/reboot',
  requirePbxPermission('can_manage_pbx_endpoints'),
  async (req, res, next) => {
    try {
      res.json(await pbx.rebootFaxAta(req.params.macAddress));
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/uc/settings',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      res.json(await pbx.listUcSettings(req.query));
    } catch (err) {
      return scopeErr(err, 'uc_config', res, next);
    }
  }
);

router.get(
  '/uc/config',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      const { subscriber, ...rest } = req.query;
      if (!subscriber) {
        return res.status(400).json({ message: 'subscriber query parameter is required' });
      }
      const domain = await domainFromRequest(req);
      res.json(await pbx.listUcConfig(domain, subscriber, rest));
    } catch (err) {
      return scopeErr(err, 'uc_config', res, next);
    }
  }
);

router.post(
  '/uc/config-rules',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.storeUcConfigRule(req.body));
    } catch (err) {
      return scopeErr(err, 'uc_config', res, next);
    }
  }
);

router.get(
  '/uc/config-rules/:ruleId',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      res.json(await pbx.getUcConfigRule(req.params.ruleId));
    } catch (err) {
      return scopeErr(err, 'uc_config', res, next);
    }
  }
);

router.delete(
  '/uc/config-rules/:ruleId',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.deleteUcConfigRule(req.params.ruleId));
    } catch (err) {
      return scopeErr(err, 'uc_config', res, next);
    }
  }
);

router.get(
  '/entitlements/offerings',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (_req, res, next) => {
    try {
      res.json(await pbx.listEntitlementOfferings());
    } catch (err) {
      return scopeErr(err, 'entitlement', res, next);
    }
  }
);

router.get(
  '/entitlements/offeroptions',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      res.json(await pbx.listEntitlementOfferOptions(req.query));
    } catch (err) {
      return scopeErr(err, 'entitlement', res, next);
    }
  }
);

router.get(
  '/entitlements/offervalue',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      res.json(await pbx.getEntitlementOfferValue(req.query));
    } catch (err) {
      return scopeErr(err, 'entitlement', res, next);
    }
  }
);

router.get(
  '/entitlements',
  requireAnyPbxPermission('can_view_extensions_page', 'can_view_endpoint_control'),
  async (req, res, next) => {
    try {
      res.json(await pbx.listEntitlements(req.query));
    } catch (err) {
      return scopeErr(err, 'entitlement', res, next);
    }
  }
);

router.put(
  '/entitlements',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.storeEntitlement(req.body));
    } catch (err) {
      return scopeErr(err, 'entitlement', res, next);
    }
  }
);

router.delete(
  '/entitlements/:entitlementId',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.deleteEntitlement(req.params.entitlementId));
    } catch (err) {
      return scopeErr(err, 'entitlement', res, next);
    }
  }
);

router.get(
  '/cnam-outbound/:phoneNumber(\\d{11})',
  requirePbxPermission('can_view_phone_numbers_page'),
  async (req, res, next) => {
    try {
      await assertPhoneInAssignedDomain(req, req.params.phoneNumber);
      res.json(await pbx.getOutboundCnam(req.params.phoneNumber));
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/cnam-outbound/:phoneNumber(\\d{11})',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.setOutboundCnam(req.params.phoneNumber, req.body));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/cnam-outbound/:phoneNumber(\\d{11})',
  requirePbxPermission('can_manage_pbx_routing'),
  async (req, res, next) => {
    try {
      res.json(await pbx.removeOutboundCnam(req.params.phoneNumber));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
