# Document 01 — Product Overview: Authentication & User Management

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, QA, Product |
| **Related docs** | `02-System-Architecture.md`, `04-Authentication.md`, `05-Authorization-RBAC.md`, `06-User-Profile.md`, `07-Security.md`, `08-API-Specification.md`, `09-Frontend-Architecture.md`, `10-UI-Components.md`, `11-Testing.md`, `12-Implementation-Roadmap.md`, `13-Acceptance-Criteria.md` |

**Status legend:** ✅ Implemented in the codebase · 🚧 Planned for the remainder of Phase 4

---

## Approved Decisions (for quick reference)

| ID | Decision | Resolution |
|---|---|---|
| D-1 | `ADMIN` vs `SUPER_ADMIN` | **Both exist.** Hierarchy: `SUPER_ADMIN` → `ADMIN` → `MANAGER` → `STAFF` → `CUSTOMER`. `SUPER_ADMIN` = full unrestricted access, manages admins, system settings, feature flags, emergency overrides. `ADMIN` = platform administration (user mgmt, hotel config, pricing, content). |
| D-2 | Staff specializations | **One `STAFF` role; capabilities via permissions/specializations.** No separate `CONCIERGE`, `RECEPTIONIST`, `RESTAURANT_STAFF`, etc. roles. Staff capabilities are granted per `StaffDepartment` (FRONT_DESK, RESTAURANT, KITCHEN, HOUSEKEEPING, MAINTENANCE, CONCIERGE, SECURITY, SPA, EVENTS). See §4.3 for the specialization × permission matrix. |

---

## Approved Decisions (Phase 4)

Decisions recorded here are binding for the entire document series. Later documents reference them by ID instead of re-litigating them.

| ID | Decision | Status |
|---|---|---|
| **D-1** | **Keep both `ADMIN` and `SUPER_ADMIN`.** Add `SUPER_ADMIN` as a new `UserRole` enum value above `ADMIN` (full hierarchy: `SUPER_ADMIN → ADMIN → MANAGER → STAFF → CUSTOMER`). | 🚧 Planned — schema change (`UserRole` enum) + guard updates |
| **D-2** | **Staff specialization is modeled as permissions under one `STAFF` role, not per-job-title roles.** Job functions (reception, restaurant, housekeeping, maintenance, concierge, kitchen, spa, events, security) map to `StaffDepartment` + permission grants. The existing `CONCIERGE` role migrates into `STAFF` + `CONCIERGE` specialization. | 🚧 Planned — schema/data migration |
| **D-3** | **Permission naming convention: `<resource>:<action>` kebab-case** (matches the existing seed, e.g. `bookings:create`, `bookings:read:own`). Product examples like `manage_orders` and `check_in_guest` map to `orders:manage` and `guests:check-in`. | ✅ Current |

> **Decision hierarchy:** `SUPER_ADMIN ↓ ADMIN ↓ MANAGER ↓ STAFF ↓ CUSTOMER`. Capabilities come from permissions, not role names. This keeps roles stable as the hotel grows and supports future multi-branch operation.

---

## 1. Project Vision

### Why this authentication system exists

The Kings Hotel is evolving from a static marketing website into an operational hospitality platform. Every future phase — bookings, payments, restaurant orders, reservations, notifications, and the AI concierge — depends on a trusted identity layer. Without it, there is no way to know *who* is making a booking, *what* they are permitted to do, or *who* acted on the platform and when.

Phase 4 builds that identity layer: a single, secure, production-grade authentication and user-management system shared by every guest-facing and staff-facing feature that follows.

### What problems it solves

1. **Account ownership** — every guest action (book, review, order) is bound to a durable user account rather than anonymous browser state.
2. **Privilege separation** — hotel staff, managers, and administrators get exactly the access their job requires, enforced in one place.
3. **Trust & accountability** — audit trails and session control give management visibility into who did what.
4. **Onboarding friction** — fast, mobile-friendly registration and login reduce abandoned bookings.
5. **Foundation risk** — a correct identity layer now prevents costly rework when booking/payment phases land.

### How it supports the hospitality platform

Phase 4 is the trunk of the platform tree. Booking (Phase 5), payments (Phase 6), restaurant/reservations, notifications, and analytics all attach to `User`, `Role`, `Session`, and `AuditLog`. Getting this layer right is the single highest-leverage investment in the roadmap.

---

## 2. Goals

### 2.1 Functional goals

| # | Goal | Status |
|---|---|---|
| F1 | Secure user registration (guests, and staff/admin via seed) | ✅ |
| F2 | Secure login with credentials (email + password) | ✅ |
| F3 | Logout / session termination | ✅ |
| F4 | Session management (JWT session, expiry, refresh via re-login) | ✅ |
| F5 | User profiles (read + update own profile) | ✅ |
| F6 | Admin authentication (seeded `ADMIN` account, `role: ADMIN`) | ✅ |
| F7 | Staff authentication (staff roles created by admins) | 🚧 staff management UI |
| F8 | Role-based authorization (RBAC) at API, page, and component level | ✅ (API/middleware) 🚧 (pages/components) |
| F9 | Email verification | 🚧 |
| F10 | Password recovery (forgot + reset) | 🚧 |
| F11 | Audit logging of auth events | 🚧 |
| F12 | Rate limiting on auth endpoints | 🚧 |
| F13 | Session/device tracking | 🚧 |
| F14 | Email change flow | 🚧 |
| F15 | Account deletion flow | 🚧 |

### 2.2 Non-functional goals

| # | Goal | How it is met |
|---|---|---|
| N1 | **Fast** — auth checks add negligible latency | Edge middleware (86.7 kB, no Prisma) for session check; bcrypt cost factor tuned to 10; `auth()` is cached per-request |
| N2 | **Scalable** — stateless JWT sessions | JWT session strategy means no per-request database session lookups; scale-out friendly |
| N3 | **Secure** — OWASP-conscious | bcryptjs hashing, HttpOnly + Secure + SameSite cookies, strict auth-page validation, `@/lib/errors` typed failures, edge-safe secrets via env |
| N4 | **Maintainable** — small, named modules | `src/lib/auth/` split into `config`, `credentials`, `edge`, `index`, `roles`, `session`; single zod validation source; REST envelope shared by all handlers |
| N5 | **Accessible** — WCAG-minded forms | Labelled inputs, `aria-invalid`, inline error text, focus-visible rings on auth pages |
| N6 | **Mobile-friendly** | Responsive auth pages (`/login`, `/register`, `/profile`) on the existing token design system |

---

## 3. Scope

### 3.1 In scope (Phase 4)

- ✅ Registration (guest accounts)
- ✅ Login / logout
- ✅ Session management (JWT, expiry, logout)
- 🚧 Password reset (forgot password + reset with expiring token)
- 🚧 Email verification
- ✅ Profile management (read/update own profile)
- ✅ RBAC core (role model, permission sets, role guards, protected APIs)
- 🚧 RBAC surface (admin/staff dashboards, user administration UI)
- 🚧 Session/device tracking
- 🚧 Audit logging of auth events
- 🚧 Rate limiting on auth endpoints

### 3.2 Not in scope (Phase 4)

- ❌ Booking engine (Phase 5)
- ❌ Payments / Paystack integration (Phase 6)
- ❌ Restaurant ordering & menu management (later phase)
- ❌ Reservations (table / pool / events) (later phase)
- ❌ Analytics & reporting (later phase)
- ❌ Notifications / email marketing (later phase)
- ❌ OAuth providers (Google, Facebook) — adapter tables are present; providers are not enabled
- ❌ Password change is partially supported (`changePasswordSchema` defined; `PATCH /api/profile` wires password fields) 🚧

---

## 4. User Types

### 4.1 Role model — current vs target

**Current implementation** (`prisma/schema.prisma` `UserRole` enum, seeded in `prisma/seed.ts`):

`CUSTOMER`, `STAFF`, `MANAGER`, `CONCIERGE`, `ADMIN`

Current seeded permission sets:

| Role | Permissions |
|---|---|
| `CUSTOMER` | `bookings:create`, `bookings:read:own`, `reviews:create` |
| `STAFF` | `bookings:read`, `bookings:update`, `restaurant:manage` |
| `MANAGER` | `users:read`, `bookings:manage`, `payments:manage`, `reviews:manage` |
| `CONCIERGE` | `bookings:create`, `bookings:read`, `reservations:manage` |
| `ADMIN` | `*` (wildcard — all permissions) |

**Target role model (per D-1 / D-2, Phase 4 remainder):**

`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER`

Changes required:

1. Add `SUPER_ADMIN` to the `UserRole` enum (top of hierarchy).
2. Remove `CONCIERGE` as a top-level role; migrate it into `STAFF` + a `CONCIERGE` staff specialization (D-2). Existing `CONCIERGE` users move to `STAFF` with the concierge permission grant.
3. `STAFF` capabilities come from permission grants (per `StaffDepartment` specialization), not from role names.

> The schema's `permissions: String[]` is the **source of truth**; the hard-coded helper sets in `src/lib/auth/roles.ts` (`staffRoles`, `adminRoles`) are the compiled-level approximation used by guards and middleware today. After the D-1 migration, `adminRoles` = `{SUPER_ADMIN, ADMIN, MANAGER}` and `staffRoles` = `{SUPER_ADMIN, ADMIN, MANAGER, STAFF}`. Document 05 defines the convergence.

### 4.2 Conceptual → implemented mapping

| Conceptual actor | Target role | Staff specialization | Notes |
|---|---|---|---|
| Guest (unauthenticated visitor) | *(no `User` record)* | — | Browsing, room viewing, contact form |
| Registered Customer | `CUSTOMER` | — | Can book, review, manage own profile |
| Receptionist / Front Desk | `STAFF` | `FRONT_DESK` | Creates/updates bookings, guest check-in |
| Restaurant Staff | `STAFF` | `RESTAURANT` | Manages orders/menu |
| Kitchen Staff | `STAFF` | `KITCHEN` | Order fulfillment |
| Housekeeping | `STAFF` | `HOUSEKEEPING` | Room status updates |
| Maintenance | `STAFF` | `MAINTENANCE` | Maintenance tasks |
| Concierge | `STAFF` | `CONCIERGE` | Reservations, guest services (migrates from `CONCIERGE` role) |
| Spa / Events staff | `STAFF` | `SPA` / `EVENTS` *(enum additions 🚧)* | Reservations for those facilities |
| Manager | `MANAGER` | — | Users read, bookings/payments/reviews manage |
| Administrator | `ADMIN` | — | Platform admin, user mgmt, config, pricing, content |
| Super Administrator | `SUPER_ADMIN` | — | Full access, manage admins, system settings, feature flags, emergency overrides |

### 4.3 Per-role responsibilities & permissions

#### Guest
- **Responsibilities:** Browse the public site, view rooms, submit contact inquiries.
- **Permissions:** Public content only.
- **Restrictions:** Cannot create bookings or reviews; cannot access `/profile`.
- **Navigation:** Full public nav (Home, Rooms, Experience, Services, About, Contact, Testimonials).
- **Dashboard access:** None.

#### Registered Customer (`CUSTOMER`)
- **Responsibilities:** Create bookings, write room reviews, maintain own profile.
- **Permissions:** `bookings:create`, `bookings:read:own`, `reviews:create`.
- **Restrictions:** Cannot read other users' data, cannot manage inventory, cannot moderate content.
- **Navigation:** Public nav + `My Profile`; future `My Bookings`.
- **Dashboard access:** Personal dashboard only (future).

#### Staff (`STAFF`) — with specialization (D-2)

One role; capabilities are granted per specialization. Representative grants (target; Document 05 defines the full catalog):

| Specialization | Example permission grants |
|---|---|
| `FRONT_DESK` | `bookings:read`, `bookings:create`, `bookings:update`, `guests:check-in`, `reservations:manage` |
| `RESTAURANT` | `orders:read`, `orders:update`, `menu:manage` |
| `KITCHEN` | `orders:read`, `orders:fulfill` |
| `HOUSEKEEPING` | `rooms:status:update`, `housekeeping:manage` |
| `MAINTENANCE` | `maintenance:manage` |
| `CONCIERGE` | `bookings:create`, `bookings:read`, `reservations:manage`, `guest-services:manage` |
| `SPA` / `EVENTS` *(🚧)* | `spa:manage` / `events:manage` |
| `SECURITY` | `security:manage` |

- **Responsibilities:** Daily operational tasks within their specialization.
- **Restrictions:** No financial controls, no user administration, no role escalation.
- **Navigation:** Public nav + staff console (future).
- **Dashboard access:** Operations console (future).

#### Manager (`MANAGER`)
- **Responsibilities:** Oversee operations, read users, manage bookings, payments, review moderation, staff oversight.
- **Permissions:** `users:read`, `bookings:manage`, `payments:manage`, `reviews:manage`.
- **Restrictions:** Cannot assign or manage `ADMIN`/`SUPER_ADMIN` accounts.
- **Dashboard access:** Management console (future).

#### Administrator (`ADMIN`)
- **Responsibilities:** Platform administration — user management, hotel configuration, pricing, content.
- **Permissions:** `*` (all except the super-admin-only operations below).
- **Restrictions:** Cannot manage other `ADMIN` accounts, cannot change system settings or feature flags (super-admin scope).
- **Dashboard access:** Admin console (future).

#### Super Administrator (`SUPER_ADMIN`)
- **Responsibilities:** Full unrestricted access — manage admins, system settings, database maintenance tools, feature flags, emergency overrides.
- **Permissions:** `*` (highest tier; effective superset of `ADMIN`).
- **Restrictions:** None within the platform (still subject to audit logging).
- **Dashboard access:** Full admin console (future).

### 4.4 Seed account

`npm run db:seed` (config: `prisma/seed.ts`):
- Upserts the five role rows with the permission sets in §4.1 (current).
- Creates a verified admin: email from `SEED_ADMIN_EMAIL` (default `admin@thekingshotel.com`), password from `SEED_ADMIN_PASSWORD` (default `Admin123!`, bcrypt cost 10).
- 🚧 Target: seed `SUPER_ADMIN` (default `superadmin@thekingshotel.com`) and rework role rows per D-1/D-2.

### 4.5 Decision log

- **D-1 (resolved):** Both `ADMIN` and `SUPER_ADMIN` exist. Rationale: value grows with platform scale and future multi-branch support. See the Approved Decisions table at the top of this document.
- **D-2 (resolved):** Staff specializations are permissions under one `STAFF` role. Rationale: avoids role explosion as the hotel adds departments. See the Approved Decisions table.
- **Remaining (to resolve in `05-Authorization-RBAC.md`):** exact permission catalog per specialization; how `permissions: String[]` data is enforced at runtime (guard vs. middleware vs. decorator); whether `SUPER_ADMIN` operations are enforced purely by role or by a dedicated permission set.

---

## 5. Authentication Philosophy

### Why Auth.js (NextAuth v5)

- **Native App Router integration** — `NextAuth()` handlers, server-side `auth()`, and middleware hooks are first-class in Next.js 15.
- **Battle-tested** — the de-facto standard for Next.js auth; maintained by the Next.js ecosystem.
- **Prisma adapter** — `@auth/prisma-adapter` maps to our existing PostgreSQL schema (`Account`, `Session`, `VerificationToken`) with zero bespoke plumbing.
- **Edge-compatible** — the config can be shared between Edge middleware and Node runtime without bundling Prisma into the middleware (current middleware bundle: 86.7 kB, no Prisma).

### Why JWT sessions over database sessions

- **Stateless** — the session is a signed cookie; no DB hit per request → lower latency, simpler horizontal scaling.
- **Small footprint** — only `id`, `email`, `name`, `image`, `role` are embedded in the token; no sensitive data.
- **Trade-off accepted** — server-side revocation is weaker; this is mitigated by short session lifetime and full logout. If revocation becomes critical, we can switch `Session` strategy (adapter tables already exist).

### Why secure cookies

- JWT is delivered via an **HttpOnly, Secure, SameSite** cookie set by Auth.js.
- HttpOnly prevents XSS token theft; SameSite mitigates CSRF; Secure enforces HTTPS in production.

### Why Prisma + PostgreSQL

- PostgreSQL is the platform's single source of truth (schema in `prisma/schema.prisma`).
- Transactions and referential integrity for users/roles/staff/audit are native.

### Why bcryptjs

- bcrypt with **cost factor 10** — GPU-resistant, widely audited.
- `bcryptjs` (pure-JS) avoids native compilation on the Windows toolchain while matching the `bcrypt` API. If performance demands it, we can swap to the native `bcrypt` or `argon2` without changing call sites (see `07-Security.md`).

### What is explicitly rejected

- ❌ Hand-rolled session tokens stored in cookies without signing
- ❌ Plaintext or unsalted password storage
- ❌ Storing the full Prisma client in Edge middleware
- ❌ Per-feature auth logic scattered through pages (everything goes through `src/lib/auth/`)

---

## 6. Authorization Philosophy

Permissions are checked as a **pipeline**, not scattered `if (user.role === "ADMIN")` checks:

```
Role → Permission → Middleware → API → Page → Component
```

1. **Role** — `User.roleId → Role`; role carries `permissions`.
2. **Permission** — actions are named `<resource>:<action>` (e.g. `bookings:read:own`); a role grants a set; `ADMIN` has `*`.
3. **Middleware** — `src/middleware.ts` gates protected routes (redirects unauthenticated page requests, returns 401 JSON for protected APIs).
4. **API** — route handlers call `requireAuth()` / `requireRole(...)` / `requireAdmin()` from `src/lib/auth/roles.ts` and `session.ts`.
5. **Page** — server components call the same guards before rendering.
6. **Component** — client components receive "can do X" props computed server-side; never evaluate permissions client-side.

### Guard primitives (implemented, `src/lib/auth/`)

| Helper | Behavior |
|---|---|
| `authenticated()` | Returns whether a session exists |
| `currentUser()` | Returns `SessionUser` or `null` |
| `requireAuth()` | Throws `UnauthorizedError` (401) if no session |
| `requireSelfOrAdmin(userId)` | Own account, or `ADMIN`/`MANAGER` |
| `isAdmin(role)` | `ADMIN` or `MANAGER` |
| `isStaff(role)` | `STAFF`, `MANAGER`, `CONCIERGE`, `ADMIN` |
| `isCustomer(role)` | `CUSTOMER` |
| `isStaffOrAdmin(role)` | Any staff-tier role |
| `requireRole(...roles)` | Requires one of the given roles, else 403 |
| `requireAdmin()` | Requires `ADMIN` or `MANAGER` |
| `requireStaff()` | Requires any staff-tier role |
| `requireCustomer()` | Requires `CUSTOMER` |

### Why permission strings, not enum checks

Permission strings scale: adding a capability later (e.g. `payments:refund`) means adding a string and granting it to the right roles — no code recompiles required. Role → permission is data, and data is easy to audit, seed, and change.

---

## 7. Security Philosophy

| Concern | Approach | Status |
|---|---|---|
| **Password hashing** | `bcryptjs` cost 10 (`prisma/seed.ts`, `auth-service.ts`) | ✅ |
| **Session cookies** | HttpOnly + Secure + SameSite via Auth.js JWT cookie | ✅ |
| **CSRF** | Auth.js CSRF protection for `[...nextauth]`; SameSite cookie policy; custom API routes don't accept cookies as credentials | ✅ |
| **XSS** | React escapes output; no `dangerouslySetInnerHTML` in auth surfaces; HttpOnly cookies resist token theft | ✅ |
| **SQL injection** | Prisma parameterized queries only; no string-built SQL | ✅ |
| **Input validation** | Zod schemas at the API boundary (`src/lib/validations/`), enforced by `withValidation` | ✅ |
| **Email verification** | `User.emailVerified` field + `VerificationToken` table; flow 🚧 | 🚧 |
| **Account recovery** | Forgot/reset password with expiring `VerificationToken` 🚧 | 🚧 |
| **Session expiration** | JWT `expires` short-lived; re-login refresh | ✅ |
| **Device tracking** | Planned — sessions table or signed token claims | 🚧 |
| **Audit logging** | `AuditLog` model exists; write wiring 🚧 | 🚧 |
| **Rate limiting** | Planned on `/api/auth/*`, `/api/auth/login`, `/api/auth/register` | 🚧 |
| **Secrets** | Env-driven (`NEXTAUTH_SECRET`, `SEED_ADMIN_*`, `RESEND_*`, `CLOUDINARY_*`); `.env.example` documents them; never committed | ✅ |
| **Error leakage** | Typed error responses (`@/lib/errors`) — no stack traces to clients | ✅ |

Full treatment in `07-Security.md`.

---

## 8. User Lifecycle

### 8.1 Primary journey (guest → authenticated)

```
Guest
  │  visits site, chooses to book
  ▼
Register (POST /api/auth/register → zod + bcrypt, creates CUSTOMER)
  │
  ▼
[Email verification 🚧 — emailVerified: false until verified]
  │
  ▼
Login (POST /api/auth/login → credentials provider, bcrypt compare)
  │
  ▼
Authenticated User (JWT session cookie; role in session)
  │
  ▼
Book Room (future Phase 5 — requires CUSTOMER role)
  │
  ▼
Logout (POST /api/auth/logout → session cookie cleared)
  │
  ▼
Session Ends
```

### 8.2 Supporting flows

- **Forgot password** 🚧 — `/api/auth/forgot` (or `/api/auth/reset`) → generate expiring `VerificationToken` → email via Resend → link to reset page.
- **Password reset** 🚧 — verify token (single-use, expiry) → validate via `changePasswordSchema` → rehash → invalidate active sessions.
- **Email change** 🚧 — require current password → new email → verification token to the new address → swap on confirm.
- **Account deletion** 🚧 — self-service requires password confirmation; admin deletion restricted to `ADMIN`; soft state flags preferred over hard deletes where FK integrity demands it (`isActive` exists today).

### 8.3 Lifecycle states

`Guest` → `Registered (unverified)` → `Registered (verified)` → `Authenticated` → `Suspended/Deactivated (isActive=false)` → `Deleted`.

---

## 9. Success Metrics

| Metric | Target | How measured |
|---|---|---|
| Registration success rate | ≥ 98% (no server errors on valid input) | API error logs on `/api/auth/register` |
| Login success rate | ≥ 98% | `/api/auth/login` logs |
| Average login latency (p95) | < 400 ms | Server timing / logs (bcrypt ~50–100 ms dominates) |
| Session reliability | 0 silent logouts mid-booking | QA flow tests, error monitoring |
| Password reset completion | ≥ 80% of initiated resets | Reset flow funnel |
| Auth API error rate | < 1% (excluding validation failures) | Log aggregation |
| Audit coverage of auth events | 100% of login/register/logout events recorded (when audit 🚧 lands) | `AuditLog` counts |

---

## 10. Dependencies

| Dependency | Version (project) | Role in Phase 4 | Status |
|---|---|---|---|
| Next.js | `15.5.22` | App Router, middleware, route handlers | ✅ installed |
| React | `19.2.8` | UI | ✅ installed |
| Auth.js (NextAuth) | `5.0.0-beta.32` | Sessions, credentials login, middleware auth | ✅ installed |
| `@auth/prisma-adapter` | `2.11.3` | Adapter tables (`Account`, `Session`, `VerificationToken`) | ✅ installed |
| Prisma Client | `5.19.0` | Data access, schema | ✅ installed |
| PostgreSQL | (Neon-compatible) | Persistence — requires a running instance | ⚠️ runtime dep (no live DB yet) |
| Zod | `3.23.8` | API/validation schemas | ✅ installed |
| React Hook Form + `@hookform/resolvers` | `7.52.1` / `3.9.0` | Future auth/profile forms | ✅ installed (unused; for Phase 4 remainder) |
| bcryptjs | `3.0.3` | Password hashing (cost 10) | ✅ installed |
| TanStack Query | — | Server-state management for authenticated data | 🚧 planned |
| Cloudinary | — | Profile avatars / image uploads | 🚧 planned (env placeholder exists) |
| Resend | — | Verification + password-reset emails | 🚧 planned (env placeholder exists) |
| lucide-react | `0.417.0` | Icons | ✅ installed |

**Runtime requirements:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (see `.env.example`).

---

## 11. Folder Ownership

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page (client)            ✅
│   │   ├── register/page.tsx       # Registration page (client)     ✅
│   │   └── profile/page.tsx        # Profile page (client)          ✅
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler          ✅
│   │   │   ├── register/route.ts       # Guest registration        ✅
│   │   │   ├── login/route.ts          # Credentials login          ✅
│   │   │   ├── logout/route.ts         # Logout                     ✅
│   │   │   └── me/route.ts             # Current user               ✅
│   │   ├── profile/route.ts            # GET/PUT own profile        ✅
│   │   └── users/route.ts + [id]/      # Admin/staff user mgmt      ✅ (API) 🚧 (UI)
│   └── middleware.ts               # Edge session gate              ✅
├── components/
│   ├── auth/                      # Auth-specific components        🚧 (planned)
│   └── profile/                   # Profile components              🚧 (planned)
├── lib/
│   ├── auth/                      # Auth.js split modules:
│   │   ├── config.ts              #   shared edge-safe config       ✅
│   │   ├── credentials.ts         #   credentials provider          ✅
│   │   ├── edge.ts                #   Edge instance for middleware  ✅
│   │   ├── index.ts               #   full runtime instance         ✅
│   │   ├── roles.ts               #   RBAC helpers                  ✅
│   │   └── session.ts             #   session helpers               ✅
│   ├── repositories/              # user-repository, role-repository ✅
│   ├── services/                  # auth-service, user-service, profile-service ✅
│   ├── validations/               # zod schemas (user, common, …)    ✅
│   ├── errors/                    # typed API errors                 ✅
│   ├── middleware/                # with-error-handler, with-validation ✅
│   ├── security/                  # rate limiting, hashing helpers   🚧 (planned)
│   └── types/                     # DTOs                             ✅
├── types/
│   └── next-auth.d.ts             # Session.user/JWT augmentation    ✅
└── prisma/
    ├── schema.prisma              # User, Role, Account, Session,    ✅
    │                              # VerificationToken, Staff, AuditLog
    ├── migrations/                # 0_init                           ✅
    └── seed.ts                    # roles + admin user               ✅
```

> Folders marked 🚧 (`components/auth`, `components/profile`, `lib/security`, dashboard/admin route groups) are the target home for the Phase 4 remainder. Document 09 (`Frontend-Architecture.md`) and 02 (`System-Architecture.md`) define them precisely.

---

## 12. Coding Standards

### Naming conventions
- Files: `kebab-case.ts` / `page.tsx`.
- Modules under `src/lib/auth/`: lowercase, singular (`config.ts`, `roles.ts`, `session.ts`).
- Routes: REST verbs on handlers (`GET`/`POST`/`PATCH`/`DELETE` exported from `route.ts`).
- Permissions: `<resource>:<action>` kebab-case (`bookings:read:own`).
- Enum values: `UPPER_SNAKE_CASE` (`CUSTOMER`, `CHECKED_IN`).

### Error handling
- Throw typed errors from `@/lib/errors` (`UnauthorizedError`, `ForbiddenError`, `ValidationError`, `NotFoundError`, `ConflictError`, `NotImplementedError`).
- Every route handler wrapped in `withErrorHandler` (uniform JSON envelope, no stack traces).
- Error envelope: `{ success: false, error: string, code: string }`.

### Validation
- Zod schemas in `src/lib/validations/`, enforced at the API boundary with `withValidation`.
- Client-side forms pre-validate with the same schema via `@hookform/resolvers` (Phase 4 remainder).
- No trusting client input: re-validate server-side on every request.

### API responses
- Success envelope: `{ success: true, data, message? }` (`jsonOk`, `jsonCreated` from `src/lib/utils`).
- All auth/protected APIs return `dynamic = "force-dynamic"`.

### Logging
- Preserve and forward `x-request-id` (set by middleware) for correlation.
- Do not log passwords, password hashes, tokens, or PII beyond necessity.

### Comments
- Comments explain *why*, not *what*. No commented-out code. Spec documents are the source of intent.

### Accessibility
- Every form field: `<label>` + `htmlFor`/`id`, `aria-invalid` on error, inline error text with `role="alert"` for fatal errors.
- Visible focus states via `focus-visible` tokens.

### Performance
- Keep the middleware bundle Prisma-free (Edge runtime) — only the shared `authConfig`.
- Cache `auth()` calls per request; avoid repeated bcrypt/DB work.

### Testing requirements
- Zod schema unit tests; role/guard unit tests; API route integration tests against a test database; UI smoke tests. See `11-Testing.md`.

---

## 13. Deliverables

By the end of Phase 4, the project will have:

- ✅ Secure registration + credentials login + logout
- ✅ Stateless JWT session management with edge middleware protection
- ✅ Role-based authorization (RBAC) — roles, permission sets, guards, protected APIs
- ✅ User profile management (read/update own profile)
- 🚧 Email verification with expiring tokens (Resend)
- 🚧 Password recovery (forgot + reset)
- 🚧 Security middleware hardening (rate limiting on auth endpoints)
- 🚧 Audit logging for auth events (`AuditLog`)
- 🚧 Session/device tracking
- 🚧 Admin & staff user-management surfaces (RBAC UI)
- ✅ Production-ready authentication foundation on which booking/payment phases build

---

*End of Document 01. Next: `02-System-Architecture.md`.*
