import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { attachPermissions } from '../middleware/permissions.js';
import { requireAnyPbxPermission, requirePbxPermission } from '../middleware/pbxAccess.js';
import * as pbx from '../services/skyswitch/pbx.js';
import { SKYSWITCH_API_REGISTRY, SKYSWITCH_OUT_OF_SCOPE } from '../services/skyswitch/apiRegistry.js';

const router = Router();

router.use(requireAuth, attachPermissions, requireAnyPbxPermission(
  'can_view_pbx_dashboard',
  'can_view_endpoint_control',
  'can_view_offline_endpoints',
  'can_view_sip_alg',
  'can_view_e911_review',
  'can_view_e911_reports',
  'can_view_troubleshooting',
  'can_view_sip_trunks',
  'can_view_extensions_page',
  'can_view_call_logs_page',
  'can_view_call_routing_page',
  'can_view_phone_numbers_page',
  'can_view_voicemail_page',
  'can_view_make_call_page',
  'can_view_route_by_ani_page',
  'can_view_pbx_domains_page',
  'can_manage_pbx_reports',
  'can_access_pbx',
  'can_manage_pbx_routing',
  'can_manage_route_by_ani',
  'can_manage_e911',
  'can_manage_pbx_endpoints',
  'can_make_pbx_calls'
));

router.get('/status', async (_req, res, next) => {
  try {
    res.json(await pbx.getPbxStatus());
  } catch (err) {
    next(err);
  }
});

router.get('/domains', requireAnyPbxPermission('can_view_pbx_domains_page', 'can_view_pbx_dashboard', 'can_access_pbx'), async (_req, res, next) => {
  try {
    res.json(await pbx.listDomains());
  } catch (err) {
    next(err);
  }
});

router.get('/resellers', requireAnyPbxPermission('can_view_pbx_domains_page', 'can_view_pbx_dashboard', 'can_access_pbx'), async (_req, res, next) => {
  try {
    res.json(await pbx.listResellers());
  } catch (err) {
    next(err);
  }
});

router.get('/api-catalog', requireAnyPbxPermission('can_view_pbx_dashboard', 'can_access_pbx'), (_req, res) => {
  res.json({ implemented: SKYSWITCH_API_REGISTRY, outOfScope: SKYSWITCH_OUT_OF_SCOPE });
});

router.get('/dashboard', requirePbxPermission('can_view_pbx_dashboard'), async (req, res, next) => {
  try {
    res.json(await pbx.getDashboardSummary(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/subscribers', requireAnyPbxPermission('can_view_endpoint_control', 'can_access_pbx'), async (req, res, next) => {
  try {
    res.json(await pbx.listSubscribers(req.query.domain, req.query.filter || 'subscriber'));
  } catch (err) {
    next(err);
  }
});

router.get('/extensions', requirePbxPermission('can_view_extensions_page'), async (req, res, next) => {
  try {
    res.json(await pbx.listSubscribers(req.query.domain, 'subscriber'));
  } catch (err) {
    next(err);
  }
});

router.get('/messaging-users', requirePbxPermission('can_view_endpoint_control'), async (req, res, next) => {
  try {
    res.json(await pbx.listMessagingUsers(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/messaging/aliases/pbxuser', requirePbxPermission('can_view_endpoint_control'), async (req, res, next) => {
  try {
    const { domain, user, service, uri } = req.query;
    if (!user) {
      return res.status(400).json({ error: 'user query parameter is required' });
    }
    res.json(await pbx.getPbxUserPhoneNumbers(domain, user, { service, uri }));
  } catch (err) {
    next(err);
  }
});

router.get('/endpoints', requirePbxPermission('can_view_endpoint_control'), async (req, res, next) => {
  try {
    const [subscribers, messagingUsers] = await Promise.all([
      pbx.listSubscribers(req.query.domain, req.query.filter || 'subscriber'),
      pbx.listMessagingUsers(req.query.domain),
    ]);
    res.json({ subscribers, messagingUsers });
  } catch (err) {
    next(err);
  }
});

router.get('/offline-endpoints', requirePbxPermission('can_view_offline_endpoints'), async (req, res, next) => {
  try {
    res.json(await pbx.getOfflineEndpoints(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/e911', requireAnyPbxPermission('can_view_e911_review', 'can_view_e911_reports'), async (_req, res, next) => {
  try {
    res.json(await pbx.listE911Endpoints());
  } catch (err) {
    next(err);
  }
});

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

router.get('/e911/validate/address', requirePbxPermission('can_manage_e911'), async (req, res, next) => {
  try {
    res.json(await pbx.validateE911Address(req.query));
  } catch (err) {
    next(err);
  }
});

router.get('/e911/:phoneNumber(\\d{11})', requirePbxPermission('can_view_e911_review'), async (req, res, next) => {
  try {
    res.json(await pbx.getE911ForPhone(req.params.phoneNumber));
  } catch (err) {
    next(err);
  }
});

router.get('/trunk-groups', requirePbxPermission('can_view_sip_trunks'), async (_req, res, next) => {
  try {
    res.json(await pbx.listTrunkGroups());
  } catch (err) {
    next(err);
  }
});

router.get('/sip-alg', requirePbxPermission('can_view_sip_alg'), async (req, res, next) => {
  try {
    res.json(await pbx.getSipAlgSettings(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/call-routing', requirePbxPermission('can_view_call_routing_page'), async (req, res, next) => {
  try {
    res.json(await pbx.getCallRoutingOverview(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/routes/:phoneNumber', requirePbxPermission('can_view_call_routing_page'), async (req, res, next) => {
  try {
    res.json(await pbx.getPhoneRoute(req.params.phoneNumber));
  } catch (err) {
    next(err);
  }
});

router.get('/route-by-ani', requireAnyPbxPermission('can_view_route_by_ani_page', 'can_manage_route_by_ani'), async (req, res, next) => {
  try {
    res.json(await pbx.listRoutesByAni(req.query.domain, {
      ani: req.query.ani,
      dnis: req.query.dnis,
    }));
  } catch (err) {
    next(err);
  }
});

router.get('/voicemail', requirePbxPermission('can_view_voicemail_page'), async (req, res, next) => {
  try {
    res.json(await pbx.getVoicemailOverview(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/auto-attendants', requirePbxPermission('can_view_voicemail_page'), async (req, res, next) => {
  try {
    res.json(await pbx.listAutoAttendants(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/call-queues', requirePbxPermission('can_view_voicemail_page'), async (req, res, next) => {
  try {
    res.json(await pbx.listCallQueues(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/phone-numbers', requireAnyPbxPermission(
  'can_access_pbx',
  'can_view_pbx_dashboard',
  'can_view_call_routing_page',
  'can_view_phone_numbers_page'
), async (req, res, next) => {
  try {
    if (req.query.scope === 'inventory') {
      res.json(await pbx.listInventoryPhoneNumbers());
    } else {
      res.json(await pbx.listPbxPhoneNumbers(req.query.domain));
    }
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', requirePbxPermission('can_view_call_logs_page'), async (req, res, next) => {
  try {
    const end = req.query.end_date || new Date().toISOString().slice(0, 10);
    const start = req.query.start_date || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    res.json(await pbx.listAuditLogs({
      startDate: start,
      endDate: end,
      page: Number(req.query.page) || 1,
    }));
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({
        message: 'Audit log access requires the log scope on your SkySwitch API credentials.',
        code: 'skyswitch_log_scope_required',
      });
    }
    next(err);
  }
});

router.get('/reports/types', requirePbxPermission('can_view_e911_reports'), async (_req, res, next) => {
  try {
    res.json(await pbx.listReportTypes());
  } catch (err) {
    next(err);
  }
});

router.get('/reports', requirePbxPermission('can_view_e911_reports'), async (req, res, next) => {
  try {
    res.json(await pbx.listReports({
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.per_page) || 25,
    }));
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({
        message: 'Report access requires the report scope on your SkySwitch API credentials.',
        code: 'skyswitch_report_scope_required',
      });
    }
    next(err);
  }
});

router.get('/reports/files/:fileId/download', requirePbxPermission('can_view_e911_reports'), async (req, res, next) => {
  try {
    res.json(await pbx.getReportFileDownload(req.params.fileId));
  } catch (err) {
    next(err);
  }
});

router.get('/reports/:reportId', requirePbxPermission('can_view_e911_reports'), async (req, res, next) => {
  try {
    res.json(await pbx.getReport(req.params.reportId));
  } catch (err) {
    next(err);
  }
});

router.delete('/reports/:reportId', requirePbxPermission('can_manage_pbx_reports'), async (req, res, next) => {
  try {
    await pbx.cancelReport(req.params.reportId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/troubleshooting', requirePbxPermission('can_view_troubleshooting'), async (req, res, next) => {
  try {
    res.json(await pbx.getTroubleshootingSnapshot(req.query.domain));
  } catch (err) {
    next(err);
  }
});

router.get('/ui-config', requireAnyPbxPermission('can_view_sip_alg', 'can_view_troubleshooting'), async (req, res, next) => {
  try {
    const { domain, config_name: configName } = req.query;
    if (!configName) return res.status(400).json({ message: 'config_name is required' });
    res.json(await pbx.getUiConfig(domain, configName));
  } catch (err) {
    next(err);
  }
});

// ── Write routes ──

router.put('/routes/:phoneNumber', requirePbxPermission('can_manage_pbx_routing'), async (req, res, next) => {
  try {
    res.json(await pbx.setPhoneRoute(req.params.phoneNumber, req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/routes/:phoneNumber', requirePbxPermission('can_manage_pbx_routing'), async (req, res, next) => {
  try {
    res.json(await pbx.deletePhoneRoute(req.params.phoneNumber));
  } catch (err) {
    next(err);
  }
});

router.put('/e911/:phoneNumber(\\d{11})', requirePbxPermission('can_manage_e911'), async (req, res, next) => {
  try {
    res.json(await pbx.provisionE911(req.params.phoneNumber, req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/e911/:phoneNumber(\\d{11})', requirePbxPermission('can_manage_e911'), async (req, res, next) => {
  try {
    res.json(await pbx.unprovisionE911(req.params.phoneNumber));
  } catch (err) {
    next(err);
  }
});

router.post('/make-call', requirePbxPermission('can_make_pbx_calls'), async (req, res, next) => {
  try {
    res.status(202).json(await pbx.makeCall(req.body));
  } catch (err) {
    next(err);
  }
});

router.put('/route-by-ani', requirePbxPermission('can_manage_route_by_ani'), async (req, res, next) => {
  try {
    res.json(await pbx.provisionRouteByAni(req.query));
  } catch (err) {
    next(err);
  }
});

router.delete('/route-by-ani', requirePbxPermission('can_manage_route_by_ani'), async (req, res, next) => {
  try {
    res.json(await pbx.deleteRouteByAni(req.query));
  } catch (err) {
    next(err);
  }
});

router.put('/messaging/hubusers', requirePbxPermission('can_manage_pbx_endpoints'), async (req, res, next) => {
  try {
    res.json(await pbx.provisionHubUser(req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/messaging/hubusers/:userId', requirePbxPermission('can_manage_pbx_endpoints'), async (req, res, next) => {
  try {
    res.json(await pbx.unprovisionHubUser(req.params.userId));
  } catch (err) {
    next(err);
  }
});

export default router;
