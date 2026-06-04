# Stratelegy Insight

Self-hosted **CRM + Support desk + PBX portal** with a unified single-server architecture (Express + React + MySQL). Portal users sign in once and see only the modules and actions their role allows.

## Architecture

- **Frontend**: React 18, Vite, TanStack Query, shadcn/ui
- **Backend**: Express.js API on the same process
- **Database**: MySQL 8 (`mysql2`)
- **Auth**: JWT with bcrypt password hashing
- **Permissions**: Role-based access with optional per-user overrides (enforced on API + UI)

### Portal modules

| Module      | Sidebar                                                             | Purpose                                             |
| ----------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| **CRM**     | Dashboard, Accounts, Contacts, Leads, Calendar, Activities, Reports | Sales pipeline and customer records                 |
| **Support** | Dashboard, Tickets, Knowledge Base                                  | Help desk tickets, comments, KB                     |
| **PBX**     | Dashboard, extensions, E911, troubleshooting, etc.                  | SkySwitch telephony screens (UI; API proxy planned) |
| **Admin**   | Portal Users, Settings                                              | User/role management (admin only)                   |

Admins (`users.role = admin`) bypass all permission checks.

## Prerequisites

- Node.js 18+
- npm
- MySQL 8.0+ (running locally or remote)

## Quick start

1. Ensure MySQL is running and create a user with access (or use `root`).

2. Configure environment:

```bash
npm install
cp .env.example .env
# Edit .env — set MYSQL_PASSWORD and other values
```

3. Start the app (creates database and tables on first run):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin credentials you set in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Demo portal users (local dev only)

To seed one test account per portal role on startup, add to `.env`:

```env
SEED_DEMO_USERS=true
DEMO_USER_PASSWORD=Demo123!
```

This **never runs in production** (`NODE_ENV=production`). Demo accounts are skipped if the email already exists.

| Email                    | Portal role    |
| ------------------------ | -------------- |
| `crmuser@test.com`       | CRM            |
| `supportuser@test.com`   | Support        |
| `supportviewer@test.com` | Support Viewer |
| `pbxuser@test.com`       | PBX            |
| `fullportal@test.com`    | Full Portal    |

Use the password from `DEMO_USER_PASSWORD` (must meet the [password policy](#password-policy)).

### Password policy

All **new** and **changed** passwords must meet:

- At least **8 characters** (max 128)
- One **uppercase** letter (A–Z)
- One **lowercase** letter (a–z)
- One **number** (0–9)
- One **special character** (e.g. `!@#$%^&*`)

Enforced on the server for: Profile password change, admin reset, create user, and invite registration. The UI shows a live checklist on password fields.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Development server (API + Vite HMR)      |
| `npm run build`     | Build frontend to `dist/`                |
| `npm start`         | Production server (serves `dist/` + API) |
| `npm run lint`      | ESLint (project-wide)                    |
| `npm run typecheck` | TypeScript check via `jsconfig.json`     |

## Production deployment

The database is **fully managed by the app** — you do not run SQL scripts manually. On every start the server:

1. Creates the MySQL database if missing
2. Creates or updates tables (`server/db/schema.js`)
3. Adds any new columns from the entity/permission registry (`schemaSync.js`)
4. Seeds CRM defaults and portal roles (idempotent — skips when data exists)
5. Creates the admin user **once**, when the `users` table is empty and `ADMIN_PASSWORD` is set

### Deploy steps

1. Provision an empty MySQL 8 database (or let the app create it).
2. Set environment variables on the host (never commit `.env`):

```env
NODE_ENV=production
JWT_SECRET=<long-random-secret>
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=stratelegy
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>
APP_BASE_URL=https://app.yourdomain.com
```

3. Build and start:

```bash
npm ci
npm run build
npm start
```

4. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and create real portal users from **Portal Users**.

Do **not** set `SEED_DEMO_USERS` in production — it is ignored when `NODE_ENV=production`.

### Fresh database / reset

If you wipe the database and restart the server, schema and seeders run automatically. No manual migrations or SQL files are required.

Set `PORT`, `JWT_SECRET`, `MYSQL_*`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` via environment variables. Change the default admin password after first login.

## Database (MySQL)

| Variable         | Default      | Description                  |
| ---------------- | ------------ | ---------------------------- |
| `MYSQL_HOST`     | `localhost`  | MySQL host                   |
| `MYSQL_PORT`     | `3306`       | MySQL port                   |
| `MYSQL_USER`     | `root`       | MySQL user                   |
| `MYSQL_PASSWORD` | _(empty)_    | MySQL password               |
| `MYSQL_DATABASE` | `stratelegy` | Database name (auto-created) |

On first startup the server:

- Creates the database if it does not exist
- Creates all tables (portal auth, CRM/support entities, tickets, roles, logs, invites)
- Syncs missing columns from `entityDefinitions.js` and the permission registry (`schemaSync.js`)
- Migrates any legacy JSON rows from `entity_records` into dedicated tables (one-time, when target tables are empty)
- Seeds default CRM config (lead stages, activity types, etc.)
- Seeds **portal roles** and `role_permissions` (see [Portal roles & permissions](#portal-roles--permissions))
- Purges obsolete schema: drops `agents`, clears legacy `entity_records`, drops that table when empty
- Creates the admin user if no users exist

Uploads are stored in `data/uploads/` (not in MySQL).

### Data storage (SaaS-style)

All application data is stored in **typed MySQL tables** with server-side validation — not loose JSON blobs in `entity_records`.

| Area        | Tables                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Portal auth | `users`, `user_permissions`, `invites`, `roles`, `role_permissions`                                   |
| CRM         | `accounts`, `contacts`, `leads`, `opportunities`, `activities`, `calendar_events`                     |
| CRM config  | `contact_sources`, `lead_stages`, `activity_types`, `account_tiers`, `industries`, `default_settings` |
| Support     | `tickets`, `ticket_comments`, `kb_articles`                                                           |

The entity registry lives in `server/db/entityDefinitions.js`. CRUD goes through `server/services/saasStore.js` (whitelist columns, type coercion, required-field checks). Tickets use `server/services/ticketStore.js` with dedicated validators in `server/validators/ticket.js`.

On upgrade from older installs, `migrateEntitiesFromEntityRecords()` copies existing JSON rows into the new tables automatically. Legacy coarse permission flags on `user_permissions` are expanded to granular keys via `migratePermissionGranularity.js`.

## Portal roles & permissions

### How it works

```
users (login)
  └── user_permissions
        ├── role_id  →  roles  →  role_permissions (permission keys)
        └── use_custom_permissions = 0  →  effective access from role
            use_custom_permissions = 1  →  per-user toggles override the role
```

- **Permission registry** (single source of truth): `server/constants/permissionRegistry.js`
- **Enforcement**: `server/services/permissions.js`, `server/services/ticketPermissions.js`, `server/routes/entities.js`
- **Client resolution**: `src/lib/permissions.js`, `src/hooks/usePermissions.jsx`, `PermissionGate` component
- **Admin UI**: Portal Users → assign a seeded role or expand **Custom permissions** for overrides
- **Sidebar / pages**: `Layout.jsx` hides menu items the user cannot access

Granular permissions include per-screen navigation (e.g. `can_view_tickets_page`), entity read/write (e.g. `can_manage_leads`), and **ticket actions**: create, edit, assign, close, delete, comment.

### Seeded portal roles

| Role               | Typical use                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| **CRM**            | Sales module — accounts, contacts, leads, calendar, activities, reports |
| **Support**        | Full ticket workflow: create, edit, assign, close, comment, manage KB   |
| **Support Viewer** | View tickets and KB; **comment only**                                   |
| **PBX**            | All PBX navigation screens                                              |
| **Full Portal**    | CRM + Support + PBX + export + ticket delete                            |

Roles are defined in `server/db/seedRoles.js` and re-synced to `role_permissions` on every server start. Ticket routing (`departments`, `categories`) is configured on each portal user in **Portal Users**.

**Important:** Avoid using the master key `can_access_support` on limited roles — it expands to all support permissions. View-only roles use explicit view/comment keys only.

## Support desk (tickets)

### Ticket fields

| Field      | Notes                                                                              |
| ---------- | ---------------------------------------------------------------------------------- |
| Status     | open, in_progress, waiting_on_end_user, waiting_on_vendor, resolved, closed        |
| Priority   | low, medium, high, urgent                                                          |
| Category   | new_order_request, port_request, report_a_problem, report_an_outage, sales_inquiry |
| Department | billing, sales, support, number_porting_team                                       |
| Source     | phone, email, web, chat, other                                                     |
| Assignee   | Agent email; filtered by department/category                                       |
| Requester  | Name and email                                                                     |

Changing **category** in the UI suggests a **department** (e.g. Port Request → Number Porting Team). Ticket detail edits require **Save changes** / **Save all changes**.

### Assignee dropdown & routing

- **`GET /api/tickets/assignees?department=&category=`** — returns assignable portal users
- Sources: portal users with support edit/assign permissions and matching routing fields
- Filtered by ticket department/category; falls back to full roster if no match
- **Portal Users** (admin): configure `departments` and optional `categories` per user for ticket routing
- **Auto-assign on create**: least-loaded matching user by department/category (`server/services/tickets.js`)
- **Ticket numbers** start at **#1200** on create

### Ticket permissions (examples)

| Action                | Permission key        |
| --------------------- | --------------------- |
| View ticket detail    | `can_view_tickets`    |
| Create ticket         | `can_create_tickets`  |
| Edit fields           | `can_edit_tickets`    |
| Assign / reassign     | `can_assign_tickets`  |
| Resolve / close       | `can_close_tickets`   |
| Delete                | `can_delete_tickets`  |
| Reply / internal note | `can_comment_tickets` |

## API endpoints

| Path                           | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `/api/auth/*`                  | Login, session, profile, invite registration               |
| `/api/entities/*`              | CRM & support entity CRUD (permission-checked)             |
| `/api/tickets/assignees`       | Assignee roster for ticket UI (department/category filter) |
| `/api/functions/*`             | `getMyPermissions`, ticket number assignment, auto-assign  |
| `/api/roles`                   | List seeded portal roles with permissions (admin)          |
| `/api/permissions/definitions` | Permission groups for Portal Users UI (admin)              |
| `/api/integrations/*`          | File upload & CSV extraction                               |
| `/api/webhooks/email`          | Inbound email → ticket creation                            |
| `/api/users`                   | Create portal users (admin)                                |
| `/api/users/:id/portal-role`   | Assign portal role (admin)                                 |
| `/api/users/:id/permissions`   | Custom permission overrides (admin)                        |
| `/api/users/invite`            | Portal user invitations (admin)                            |
| `/api/realtime/*`              | SSE subscriptions (e.g. permission updates)                |

### Entity storage

- **Validated on the server** — required fields, types, and column whitelists per entity
- **Indexed columns** for filtering, sorting, and reporting
- **Foreign keys** where relationships matter (e.g. ticket comments → tickets)
- **`created_by`** set from the logged-in portal user on CRM/support creates
- **Ticket updates** use granular ticket-action checks (not generic entity write)
- **Realtime updates** — permission changes push over SSE when `user_permissions` is updated

## Portal users vs SkySwitch

|                       | Portal users                                               | SkySwitch (PBX)                             |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| **What**              | People who log in to Stratelegy                            | Telephony extensions/endpoints in SkySwitch |
| **Stored in**         | MySQL `users` + `user_permissions`                         | SkySwitch cloud (via API)                   |
| **Managed in**        | Sidebar **Portal Users** (admin)                           | PBX screens (future: `/api/pbx/*` proxy)    |
| **Permissions**       | CRM, Support, PBX _portal_ module and action keys          | N/A — API credentials on server only        |
| **Support assignees** | Support-role portal users (with routing fields on `users`) | N/A                                         |

## Developer reference

| Topic                                  | Location                                                            |
| -------------------------------------- | ------------------------------------------------------------------- |
| Permission definitions                 | `server/constants/permissionRegistry.js`                            |
| Seeded roles                           | `server/db/seedRoles.js`                                            |
| Ticket validators                      | `server/validators/ticket.js`                                       |
| Ticket routing (category → department) | `server/constants/ticketRouting.js`                                 |
| Assignee service                       | `server/services/ticketAssignees.js`                                |
| Demo user seeder (dev)                 | `server/db/seedDemoUsers.js`                                        |
| UI permission hooks                    | `src/hooks/usePermissions.jsx`, `src/components/PermissionGate.jsx` |
| Ticket UI                              | `src/pages/SupportTickets.jsx`, `src/pages/SupportTicketDetail.jsx` |

## Features

### CRM

- Accounts, contacts, leads, calendar, activities, reports
- Configurable lead stages, activity types, account tiers, industries (Settings)
- Dashboard metrics from MySQL leads/opportunities (manual entry / import; no external ERP sync)
- CSV/PDF export (requires `can_export_data`)

### Support

- Ticket list, detail, conversation thread, internal notes
- Knowledge base articles
- Email webhook → auto-create tickets
- SMTP notifications (created, assigned, updated, comment)
- Role-gated ticket actions (create / edit / assign / close / delete / comment)

### Admin

- Portal Users: invite, create, assign **portal role**, ticket routing, custom permission overrides
- Settings: CRM defaults and data export

### PBX

- Live SkySwitch Telco API integration via server-side `/api/pbx/*` proxy (OAuth credentials never sent to the browser)
- Dashboard, extensions, endpoint control, E911, trunks, routing, voicemail, troubleshooting, and related screens
- Requires `SKYSWITCH_*` env vars; portal PBX permissions still gate UI access

#### SkySwitch env (`.env`)

| Variable                   | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `SKYSWITCH_ENABLED`        | Set to `false` to disable PBX API calls        |
| `SKYSWITCH_API_URL`        | Default `https://api.skyswitch.com`            |
| `SKYSWITCH_ACCOUNT_ID`     | SkySwitch account UUID                         |
| `SKYSWITCH_CLIENT_ID`      | OAuth client ID                                |
| `SKYSWITCH_CLIENT_SECRET`  | OAuth client secret (server only)              |
| `SKYSWITCH_USERNAME`       | API resource owner username                    |
| `SKYSWITCH_PASSWORD`       | API resource owner password                    |
| `SKYSWITCH_DEFAULT_DOMAIN` | Optional default PBX domain when none selected |
| `SKYSWITCH_SCOPE`          | OAuth scope (default `*`)                      |

Portal users still log in with Stratelegy credentials. SkySwitch credentials are used only by the Express server to proxy PBX data.

## Email

### Outbound (SMTP) — configure in `.env`

All outbound emails use **SMTP via nodemailer**. Templates live in `server/services/email/templates/`.

| Variable        | Description                                                                            |
| --------------- | -------------------------------------------------------------------------------------- |
| `MAIL_ENABLED`  | Set to `true` to send real emails (default `false` — logs preview to console)          |
| `SMTP_HOST`     | SMTP server hostname (e.g. `smtp.gmail.com`, `smtp.sendgrid.net`, Amazon SES endpoint) |
| `SMTP_PORT`     | Usually `587` (STARTTLS) or `465` (SSL — set `SMTP_SECURE=true`)                       |
| `SMTP_SECURE`   | `true` for port 465, `false` for 587                                                   |
| `SMTP_USER`     | SMTP username / API key user                                                           |
| `SMTP_PASS`     | SMTP password or API key                                                               |
| `SMTP_FROM`     | From address, e.g. `"Stratelegy Insight <noreply@yourdomain.com>"`                     |
| `SMTP_REPLY_TO` | Reply-to address (optional)                                                            |
| `APP_NAME`      | Brand name shown in email headers                                                      |
| `APP_BASE_URL`  | Public app URL for links in emails (required in production)                            |
| `SUPPORT_EMAIL` | Shown in email footers                                                                 |

**Production example (`.env`):**

```env
MAIL_ENABLED=true
APP_BASE_URL=https://app.yourdomain.com
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="Stratelegy Insight <noreply@yourdomain.com>"
SMTP_REPLY_TO=support@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

When `MAIL_ENABLED=false`, emails are **not sent** — the server logs the subject and body so you can develop locally without SMTP.

### Email templates & when they send

| Template                   | Trigger                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `portal_invite`            | Admin sends **Send invite link** (Portal Users)                                                      |
| `portal_welcome`           | Admin creates a portal user with password                                                            |
| `ticket_created_requester` | Ticket created (portal, dashboard, or inbound webhook) — sent to `requester_email`                   |
| `ticket_assigned`          | Ticket auto-assigned or manually assigned — sent to assignee                                         |
| `ticket_updated`           | Ticket status, priority, or assignee changes — sent to requester                                     |
| `ticket_comment`           | New comment — sent to requester (public replies) and assignee (includes internal notes for assignee) |

Templates can be edited in `server/services/email/templates/index.js`. Shared HTML layout is in `server/services/email/templates/base.js`.

### Inbound email webhook

POST `/api/webhooks/email?secret=YOUR_SECRET` with JSON or form body containing `subject`, `body`, `from_email`. Set `EMAIL_WEBHOOK_SECRET` in production.

## Known limitations

- **Single-tenant** portal (one org per install) — not multi-tenant SaaS
- **PBX API** wired to SkySwitch via `/api/pbx/*` (set `SKYSWITCH_*` in `.env`)
- **Sales target** on CRM dashboard is not yet configurable (hardcoded)
- **Opportunities** entity exists; dedicated Opportunities page not wired in navigation
- Custom portal roles cannot be created in UI yet — use seeded roles + per-user overrides

# Stratelegy
