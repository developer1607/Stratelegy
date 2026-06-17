import { appParams } from "@/lib/app-params";
import { clearToken, getToken, setToken } from "@/lib/auth-token";

async function request(method, path, body, options = {}) {
  const headers = {
    "X-App-Id":
      appParams.appId || import.meta.env.VITE_APP_ID || "stratelegy-insight",
    ...options.headers,
  };

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body != null
          ? JSON.stringify(body)
          : undefined,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text();

  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith("/api/auth/login")) {
      clearToken();
      if (window.location.pathname !== "/login") {
        const from = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.href = `/login?from_url=${encodeURIComponent(from)}`;
      }
    }
    throw new ApiError(data?.message || res.statusText, res.status, data);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export { request };

function createEntityClient(entityName) {
  return {
    list: (sort, limit) => {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return request("GET", `/api/entities/${entityName}${qs ? `?${qs}` : ""}`);
    },
    listPage: (sort, limit, offset) => {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (limit != null) params.set("limit", String(limit));
      if (offset != null) params.set("offset", String(offset));
      const qs = params.toString();
      return request("GET", `/api/entities/${entityName}?${qs}`);
    },
    get: (id) => request("GET", `/api/entities/${entityName}/${id}`),
    filter: (query, sort) =>
      request("POST", `/api/entities/${entityName}/filter`, { query, sort }),
    create: (data) => request("POST", `/api/entities/${entityName}`, data),
    update: (id, data) =>
      request("PATCH", `/api/entities/${entityName}/${id}`, data),
    delete: (id) => request("DELETE", `/api/entities/${entityName}/${id}`),
    bulkCreate: (items) =>
      request("POST", `/api/entities/${entityName}/bulk`, { items }),
    subscribe: (callback) => {
      const token = getToken();
      const url = `/api/realtime/entities/${entityName}/subscribe`;
      const controller = new AbortController();
      let closed = false;

      (async () => {
        try {
          const headers = {
            "X-App-Id":
              appParams.appId ||
              import.meta.env.VITE_APP_ID ||
              "stratelegy-insight",
          };
          if (token) headers.Authorization = `Bearer ${token}`;

          const res = await fetch(url, {
            headers,
            credentials: "include",
            signal: controller.signal,
          });

          if (!res.ok || !res.body) {
            if (res.status !== 403) {
              console.error(
                "Realtime subscribe failed:",
                res.status,
                res.statusText,
              );
            }
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!closed) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split("\n\n");
            buffer = frames.pop() || "";

            for (const frame of frames) {
              for (const line of frame.split("\n")) {
                if (!line.startsWith("data: ")) continue;
                try {
                  callback(JSON.parse(line.slice(6)));
                } catch (e) {
                  console.error("Realtime parse error:", e);
                }
              }
            }
          }
        } catch (e) {
          if (!closed && e?.name !== "AbortError") {
            console.error("Realtime connection error:", e);
          }
        }
      })();

      return () => {
        closed = true;
        controller.abort();
      };
    },
  };
}

const ENTITY_NAMES = [
  "Account",
  "Contact",
  "Lead",
  "Opportunity",
  "Activity",
  "CalendarEvent",
  "ContactSource",
  "LeadStage",
  "ActivityType",
  "AccountTier",
  "Industry",
  "DefaultSettings",
  "Ticket",
  "TicketComment",
  "KBArticle",
  "UserPermissions",
  "User",
];

const entities = {};
for (const name of ENTITY_NAMES) {
  entities[name] = createEntityClient(name);
}

export const api = {
  entities,

  auth: {
    me: () => request("GET", "/api/auth/me"),
    updateMe: (data) => request("PATCH", "/api/auth/me", data),
    changePassword: ({ current_password, new_password }) =>
      request("PATCH", "/api/auth/me", { current_password, new_password }),
    logout: async (shouldRedirect = true) => {
      try {
        await request("POST", "/api/auth/logout");
      } catch {
        /* ignore — still clear local token */
      }
      clearToken();
      if (shouldRedirect) {
        window.location.href = "/login";
      }
    },
    redirectToLogin: (returnUrl) => {
      const from =
        returnUrl ||
        `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.href = `/login?from_url=${encodeURIComponent(from)}`;
    },
    login: async (email, password) => {
      const result = await request("POST", "/api/auth/login", {
        email,
        password,
      });
      if (result.mfa_required) {
        return {
          mfaRequired: true,
          mfaToken: result.mfa_token,
          emailHint: result.email_hint,
          expiresIn: result.expires_in,
        };
      }
      setToken(result.token);
      return { mfaRequired: false, user: result.user };
    },
    verifyMfa: async (mfaToken, code) => {
      const result = await request("POST", "/api/auth/mfa/verify", {
        mfa_token: mfaToken,
        code,
      });
      setToken(result.token);
      return result.user;
    },
    resendMfa: async (mfaToken) => {
      return request("POST", "/api/auth/mfa/resend", { mfa_token: mfaToken });
    },
    startEnableMfa: () => request("POST", "/api/auth/mfa/enable/start"),
    confirmEnableMfa: (mfaToken, code) =>
      request("POST", "/api/auth/mfa/enable/confirm", {
        mfa_token: mfaToken,
        code,
      }),
    disableMfa: (current_password) =>
      request("POST", "/api/auth/mfa/disable", { current_password }),
    registerInvite: async ({ token, email, password, full_name }) => {
      const result = await request("POST", "/api/auth/register-invite", {
        token,
        email,
        password,
        full_name,
      });
      setToken(result.token);
      return result.user;
    },
  },

  users: {
    createUser: ({
      email,
      password,
      full_name,
      role,
      grant_crm_access,
      permissions,
      portal_role_id,
    }) =>
      request("POST", "/api/users", {
        email,
        password,
        full_name,
        role,
        grant_crm_access,
        permissions,
        portal_role_id,
      }),
    inviteUser: (email, role, portal_role_id) =>
      request("POST", "/api/users/invite", { email, role, portal_role_id }),
    assignPortalRole: (userId, roleId) =>
      request("POST", `/api/users/${userId}/portal-role`, { role_id: roleId }),
    updatePermissions: (userId, updates) =>
      request("PATCH", `/api/users/${userId}/permissions`, updates),
    updateSupportRouting: (userId, { departments, categories }) =>
      request("PATCH", `/api/users/${userId}/support-routing`, {
        departments,
        categories,
      }),
    updatePbxDomains: (userId, domains) =>
      request("PATCH", `/api/users/${userId}/pbx-domains`, { domains }),
    setPassword: (userId, password) =>
      request("PATCH", `/api/users/${userId}/password`, { password }),
    updateMfa: (userId, { enabled, forced }) =>
      request("PATCH", `/api/users/${userId}/mfa`, {
        enabled,
        forced,
        mfa_email_enabled: enabled,
        mfa_email_forced: forced,
      }),
    delete: (userId) => request("DELETE", `/api/users/${userId}`),
  },

  roles: {
    list: () => request("GET", "/api/roles"),
    create: ({ name, description, permissions }) =>
      request("POST", "/api/roles", { name, description, permissions }),
    update: (id, { name, description, permissions }) =>
      request("PATCH", `/api/roles/${id}`, { name, description, permissions }),
    delete: (id) => request("DELETE", `/api/roles/${id}`),
  },

  permissions: {
    definitions: () => request("GET", "/api/permissions/definitions"),
  },

  notifications: {
    list: ({ unreadOnly = false, limit = 30, offset = 0 } = {}) => {
      const params = new URLSearchParams();
      if (unreadOnly) params.set("unread_only", "true");
      if (limit != null) params.set("limit", String(limit));
      if (offset != null) params.set("offset", String(offset));
      const qs = params.toString();
      return request("GET", `/api/notifications${qs ? `?${qs}` : ""}`);
    },
    unreadCount: () => request("GET", "/api/notifications/unread-count"),
    markRead: (id, read = true) =>
      request("PATCH", `/api/notifications/${id}/read`, { read }),
    markAllRead: () => request("POST", "/api/notifications/mark-all-read"),
    delete: (id) => request("DELETE", `/api/notifications/${id}`),
    deleteAllRead: () => request("DELETE", "/api/notifications/read"),
  },

  tickets: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value != null && value !== "") searchParams.set(key, String(value));
      }
      const qs = searchParams.toString();
      return request("GET", `/api/tickets${qs ? `?${qs}` : ""}`);
    },
    stats: () => request("GET", "/api/tickets/stats"),
    get: (id) => request("GET", `/api/tickets/${id}`),
    create: (data) => request("POST", "/api/tickets", data),
    update: (id, data) => request("PATCH", `/api/tickets/${id}`, data),
    delete: (id) => request("DELETE", `/api/tickets/${id}`),
    addComment: (id, data) =>
      request("POST", `/api/tickets/${id}/comments`, data),
    listAssignees: ({ department, category } = {}) => {
      const params = new URLSearchParams();
      if (department) params.set("department", department);
      if (category) params.set("category", category);
      const qs = params.toString();
      return request("GET", `/api/tickets/assignees${qs ? `?${qs}` : ""}`);
    },
  },

  functions: {
    invoke: (name, params) =>
      request("POST", `/api/functions/${name}`, params || {}),
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const form = new FormData();
        form.append("file", file);
        return request("POST", "/api/integrations/upload", form);
      },
      ExtractDataFromUploadedFile: ({ file_url, json_schema }) =>
        request("POST", "/api/integrations/extract", { file_url, json_schema }),
    },
  },

  appLogs: {
    logUserInApp: (pageName) =>
      request("POST", "/api/logs/in-app", { page_name: pageName }),
  },

  email: {
    listTemplates: () => request("GET", "/api/email/templates"),
    getTemplate: (id) => request("GET", `/api/email/templates/${id}`),
    previewTemplate: (id, content) =>
      content
        ? request("POST", `/api/email/templates/${id}/preview`, { content })
        : request("GET", `/api/email/templates/${id}/preview`),
    saveTemplate: (id, content) =>
      request("PUT", `/api/email/templates/${id}`, { content }),
    resetTemplate: (id) =>
      request("DELETE", `/api/email/templates/${id}/customization`),
    sendTestTemplate: (id, { to, content }) =>
      request("POST", `/api/email/templates/${id}/test`, { to, content }),
    status: () => request("GET", "/api/email/status"),
  },
};
