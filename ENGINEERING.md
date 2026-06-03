# Engineering standards — Stratelegy Insight

This document defines how we build, secure, and maintain this codebase.

## Architecture

| Layer | Path | Responsibility |
|-------|------|----------------|
| Frontend | `src/` | React SPA, pages, components, client API |
| Backend | `server/` | Express API, services, middleware, DB |
| Shared | `shared/` | Cross-runtime modules (permissions registry) |
| Scripts | `scripts/` | Ops and audit tooling |

**Single-server model:** Express serves `/api/*` and the Vite-built SPA from `dist/` in production.

## Naming conventions

| Context | Convention | Example |
|---------|------------|---------|
| React components | PascalCase files | `UserManagement.jsx` |
| Server modules | camelCase | `ticketStore.js` |
| DB / API fields | snake_case | `created_date`, `full_name` |
| Permission keys | snake_case | `can_view_tickets_page` |
| Environment variables | SCREAMING_SNAKE | `JWT_SECRET` |
| Client imports | `@/` alias → `src/` | `@/lib/errors` |

## Database & SQL

1. **Always use parameterized queries** via `server/db/query.js` (`query`, `queryOne`, `execute`).
2. **Never interpolate user input** into SQL values — use `?` placeholders.
3. **Table/column names** come from whitelists only (`entityDefinitions.js`, ticket validators, permission registry).
4. **LIMIT clauses** use `clampLimit()` from `server/utils/sql.js`.
5. **SQL errors must never reach clients** — the global error handler sanitizes them.

```javascript
// Good
await query('SELECT * FROM users WHERE email = ?', [email]);

// Bad — never do this
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

## API errors & security

1. Use `createHttpError(status, message)` for intentional 4xx responses.
2. The global handler in `server/index.js` uses `formatHttpError()` — production 500s return generic messages only.
3. **Never expose:** SQL text, stack traces, `.env` keys, OAuth secrets, raw upstream API bodies.
4. Client code should use `getUserFacingErrorMessage()` from `src/lib/errors.js` for display.
5. Auth routes are rate-limited; production uses `helmet` security headers.
6. Health check: `GET /api/health` (no auth; safe for load balancers).

## Environment variables

- Copy `.env.example` → `.env` — **never commit `.env`**.
- Production requires strong `JWT_SECRET` (enforced in `assertProductionConfig()`).
- Demo user seeding is blocked when `NODE_ENV=production`.
- Document every new config key in `.env.example`.

## Authentication & security

- **JWT** (HS256) with `issuer` + `audience` claims; 24h expiry in production, 7d in development
- **Invite-only registration** — no public signup; users complete setup via `/login?invite_token=...`
- **bcrypt** password hashing (async compare on login)
- **Brute-force protection** — 5 failed attempts → 15-minute lockout per IP+email
- **Rate limits** — login (20/15min prod), invite registration (10/hour prod)
- **Helmet** security headers, sanitized API errors (no SQL leaks)
- **Dev-only tools** hidden in production: Email Test nav, `/api/email/verify`, `/api/email/test`

## Shared constants

Put cross-stack definitions in `shared/`:

- Permissions: `shared/permissionRegistry.js`
- Password policy: `shared/passwordValidation.js`
- Ticket enums: `shared/ticketConstants.js`
- Ticket routing: `shared/ticketRouting.js`

Client imports via `@shared/...`; server re-exports from `server/utils/` or `server/constants/` shims.

## User-facing copy

- Plain language for end users and admins — no `.env`, SQL, or internal API paths in UI.
- Consistent filter labels: **"All statuses"**, **"All priorities"**.
- Use toasts (`sonner`) instead of `alert()` for feedback.
- Empty states should be specific: *"No SIP ALG settings are configured for this domain"* not *"No records found"*.

## Linting & quality

```bash
npm run lint        # ESLint (src pages/components + server + shared)
npm run typecheck   # Light TS check via jsconfig
npm run test        # Unit tests (errors, passwords, tickets, permissions)
npm run build       # Production frontend build
npm run audit:skyswitch  # API coverage audit (dev)
```

Before merging:

1. Lint passes
2. Build passes
3. Manual smoke test for auth, permissions, and changed features

## Production checklist

- [ ] `JWT_SECRET` set (32+ random characters)
- [ ] `NODE_ENV=production`
- [ ] `ADMIN_PASSWORD` set on first deploy
- [ ] `EMAIL_WEBHOOK_SECRET` set if using inbound email
- [ ] `CORS_ORIGINS` matches your domain
- [ ] Demo seeds disabled (`SEED_DEMO_USERS` not true)
- [ ] SkySwitch credentials in server env only
- [ ] Remove dev-only nav items (e.g. Email Test) before customer launch

## File organization guidelines

- **Routes** stay thin — delegate to `server/services/`.
- **PBX UI** lives under `src/components/pbx/`.
- **New entities** — add to `entityDefinitions.js`, not ad-hoc tables.
- **Migrations** — one-time changes in `server/db/migrations/`; ongoing drift in `schemaSync.js`.

## Remaining improvements (backlog)

- Consolidate ticket/password constants into `shared/`
- Replace remaining `alert()` calls with toasts
- Add automated tests for validators, permissions, auth
- CI workflow (lint + build on PR)
- Structured logging (pino/winston) with request IDs
- Webhook auth via header instead of query string
