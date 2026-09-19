# Document 05 — Authorization & RBAC

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, QA, Security |
| **Source of truth** | `src/lib/auth/roles.ts`, `src/lib/auth/session.ts`, `src/lib/auth/index.ts`, `src/types/next-auth.d.ts`, `prisma/seed.ts` (role permission sets), `src/middleware.ts` |
| **Depends on** | `01-Product-Overview.md` (decisions D-1, D-2), `03-Database-Design.md` (Role model), `04-Authentication.md` |
| **Referenced by** | `07-Security.md`, `08-API-Specification.md`, `09-Frontend-Architecture.md` |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Role Model & Hierarchy

### 1.1 Current implemented roles (`ROLES` in `src/lib/auth/roles.ts`)

| Role | Category | Seed permissions (`prisma/seed.ts`) | Notes |
|---|---|---|---|
| `CUSTOMER` | Customer | `bookings:create`, `bookings:read:own`, `reviews:create` | Registered guest |
| `STAFF` | Staff | `bookings:read`, `bookings:update`, `restaurant:manage` | Front-line staff |
| `MANAGER` | Staff (admin-tier) | `users:read`, `bookings:manage`, `payments:manage`, `reviews:manage` | Hotel management |
| `CONCIERGE` | Staff | `bookings:create`, `bookings:read`, `reservations:manage` | Concierge team |
| `ADMIN` | Admin | `["*"]` | System administrator |

### 1.2 Planned changes (D-1, D-2 from `01-Product-Overview.md`)

- **D-1 (target hierarchy):** `SUPER_ADMIN` → `ADMIN` → `MANAGER` → `STAFF` → `CUSTOMER`.
  - `SUPER_ADMIN`: permissions `["*"]` (full access).
  - `ADMIN`: downgraded to scoped permissions — `users:manage`, `hotel:configure`, `content:manage`, `pricing:manage`.
- **D-2:** Remove `CONCIERGE` as a top-level `UserRole`; migrate existing `CONCIERGE` users to `STAFF` + `CONCIERGE` `StaffDepartment` specialization. Capability differentiation then comes from permissions/`StaffDepartment`, not role names.

> **Current-state note:** today `UserRole.CONCIERGE` still exists (schema enum + `ROLES` map + seed). The two-step migration (data fix first, then enum change) is detailed in `03-Database-Design.md` §9. Until then the code below reflects the pre-migration state.

### 1.3 Categorization helpers (current, `roles.ts`)

| Helper | Membership | Notes |
|---|---|---|
| `isStaff(role)` | STAFF, MANAGER, CONCIERGE, ADMIN | Any non-customer |
| `isAdmin(role)` | ADMIN, MANAGER | **Note:** MANAGER currently counts as admin-tier |
| `isCustomer(role)` | CUSTOMER | |
| `isStaffOrAdmin(role)` | union of the above | |

> **Post-D-1 impact:** `isAdmin` and `requireAdmin` will narrow to `SUPER_ADMIN`/`ADMIN` only. MANAGER is demoted to a staff-tier role with elevated permissions. This is a breaking change to current `requireAdmin` semantics — flag for QA.

---

## 2. Permission Vocabulary

Permission strings are **denormalized into the `Role.permissions String[]` column** (seed sets them per role). They are not yet enforced by a permission-checking layer — see §4.

**Authoritative vocabulary (from `prisma/seed.ts`):**

```
bookings:create       bookings:read        bookings:read:own
bookings:update       bookings:manage      payments:manage
reviews:create        reviews:manage       users:read
restaurant:manage     reservations:manage
```

**Planned additions (D-1 / doc 03 D-RBAC-1):**
```
users:manage          hotel:configure      content:manage       pricing:manage
```

**Wildcard:** `ADMIN` currently carries `["*"]`; after D-1, `["*"]` is reserved for `SUPER_ADMIN` only.

---

## 3. Enforcement Layers

The RBAC pipeline (from `02-System-Architecture.md`) — each layer gates the next:

```
Role → Permission → Middleware → API route → Server action/Service → Page → Component
        (DB)          (Edge)      (Node)                            (UI)
```

### 3.1 Middleware (Edge) — authentication gate ✅

`src/middleware.ts` only checks **authenticated vs not** (401 / redirect). It does **not** evaluate roles or permissions.

**Planned (🚧):** add role gating for `/admin/*` and `/dashboard/*` in the middleware (role claim is already in the JWT — `request.auth` exposes it). API routes that need fine-grained checks continue to enforce in-handler.

### 3.2 API routes (Node) — authorization gate ✅

Helpers in `src/lib/auth/roles.ts`:

| Helper | Gate | HTTP error |
|---|---|---|
| `requireAuth()` | any authenticated session | 401 `UNAUTHORIZED` |
| `requireRole(...roles)` | session role ∈ list | 403 `FORBIDDEN` |
| `requireAdmin()` | role ∈ {ADMIN, MANAGER} (current) | 403 |
| `requireStaff()` | `isStaff(role)` | 403 |
| `requireCustomer()` | role = CUSTOMER | 403 |
| `requireSelfOrAdmin(userId)` | same user OR role ∈ {ADMIN, MANAGER} | 401 `UNAUTHORIZED` ("You can only access your own account") |

**Current usage:** the helpers are exported from `src/lib/auth/index.ts` and consumed by service layer functions; not every existing API route is yet wrapped in them (remaining wiring is tracked in `12-Implementation-Roadmap.md`).

### 3.3 Service layer (Node) ✅/🚧

`requireAuth()`/`requireRole()` are called inside services (e.g. `authService.getCurrentUser`, `authService.changePassword`). **Planned:** every mutating service call performs an authorization check before touching the repository.

### 3.4 Pages & server components 🚧

Planned pattern for `src/app/(public)/dashboard/**`, `(staff)/dashboard/**`, `admin/**`:

```ts
const user = await requireStaff();          // or requireRole(...)
if (user.role !== "ADMIN") notFound();      // or throwForbidden()
```

Role-based page variants render from a single layout (no duplicated page trees) — see `09-Frontend-Architecture.md`.

### 3.5 Components 🚧

`<Can permission="bookings:manage">` wrapper component planned for conditional rendering of UI (buttons, tabs). Component check is **purely cosmetic** — enforcement always happens server-side.

---

## 4. Current Gap: Permission-Enforcement Layer (🚧)

Today the **permission strings exist in the DB but nothing evaluates them**. All authorization is role-name based via the `require*` helpers.

### 4.1 Planned permission-checking service (`src/lib/services/permission-service.ts`)

```ts
async function hasPermission(userId: string, permission: string): Promise<boolean>
async function hasAnyPermission(userId: string, permissions: string[]): Promise<boolean>
async function requirePermission(permission: string): Promise<SessionUser>  // throws ForbiddenError
```

**Evaluation rules (D-RBAC-1, from doc 03):**
1. Role `["*"]` → allow everything.
2. Exact string match on `role.permissions`.
3. Optional hierarchical prefix support: `bookings:manage` implies `bookings:read`, `bookings:update` (see D-RBAC-2 below).
4. Always resolve the role from DB (not the JWT claim) for authorization decisions; the JWT claim is for middleware routing/UI only.

### 4.2 Decision record

#### D-RBAC-1 — Where permissions live
- **Options:** (a) `Role.permissions String[]` (current); (b) join table `RolePermission`; (c) hardcoded role→permission map in code.
- **Decision:** (a) for Phase 4. Small role set, additive migrations trivial. Revisit (b) when permission sets diverge per-user or grow large.

#### D-RBAC-2 — Hierarchical permission expansion
- **Options:** (a) flat match (exact strings only); (b) prefix hierarchy (`bookings:manage` → `bookings:read`/`bookings:update`).
- **Decision:** (a) flat for Phase 4 — seed data lists all granted permissions explicitly. Keep expansion as a later optimization; do **not** surprise-delegate.

#### D-RBAC-3 — DB role vs JWT role for authorization
- **Options:** (a) authorize from JWT claim (fast); (b) authorize from DB role (current plan).
- **Decision:** (b) for anything security-sensitive (`requirePermission`, services). JWT role is acceptable for middleware routing and UI gating. This makes role/permission changes take effect immediately (`/api/auth/me` already re-reads the DB role).

#### D-RBAC-4 — MANAGER in the admin tier
- **Options:** (a) keep MANAGER in `adminRoles` (current); (b) demote after D-1.
- **Decision:** (b) after D-1 lands. Until then, `requireAdmin()` and `requireSelfOrAdmin` accept MANAGER — documented behavior, not a bug. Coordinate the change with the `SUPER_ADMIN` addition so no route silently loses a caller.

---

## 5. Planned Role Matrix (post-D-1/D-2)

| Permission | SUPER_ADMIN | ADMIN | MANAGER | STAFF | CUSTOMER |
|---|---|---|---|---|---|
| `users:manage` | ✅ | ✅ | — | — | — |
| `users:read` | ✅ | ✅ | ✅ | — | — |
| `hotel:configure` | ✅ | ✅ | — | — | — |
| `content:manage` | ✅ | ✅ | — | — | — |
| `pricing:manage` | ✅ | ✅ | — | — | — |
| `bookings:manage` | ✅ | — | ✅ | — | — |
| `bookings:read` | ✅ | — | ✅ | ✅ | — |
| `bookings:create` | ✅ | — | — | ✅ | ✅ |
| `bookings:read:own` | ✅ | — | — | — | ✅ |
| `bookings:update` | ✅ | — | — | ✅ | — |
| `payments:manage` | ✅ | — | ✅ | — | — |
| `reviews:manage` | ✅ | — | ✅ | — | — |
| `reviews:create` | ✅ | — | — | ✅ | ✅ |
| `restaurant:manage` | ✅ | — | — | ✅ | — |
| `reservations:manage` | ✅ | — | — | ✅* | — |

\* `reservations:manage` moves to STAFF via the CONCIERGE staff-specialization migration (D-2); row will be removed once `CONCIERGE` enum value is dropped.

**Route gating summary (post-D-1):**

| Surface | SUPER_ADMIN | ADMIN | MANAGER | STAFF | CUSTOMER | Guest |
|---|---|---|---|---|---|---|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | redirect /login |
| `/profile` | ✅ | ✅ | ✅ | ✅ | ✅ | redirect /login |
| `/bookings` (own) | ✅ | ✅ | ✅ | ✅ | ✅ | redirect /login |
| `/admin/*` | ✅ | ✅ | 🚧 (staff view) | 🚧 (staff view) | — | redirect /login |
| `/api/users` | ✅ | ✅ | ✅ read | — | — | 401 |
| `/api/bookings` POST | ✅ | ✅ | ✅ | ✅ | ✅ | 401 |
| `/api/payments` POST | ✅ | ✅ | ✅ | — | ✅ | 401 |
| `/api/reviews` POST | ✅ | ✅ | ✅ | ✅ | ✅ | 401 |

---

## 6. Object-Level Rules (ownership)

Beyond role checks, Phase 4 defines **ownership** rules (enforced in service layer):

| Operation | Rule |
|---|---|
| Read own bookings | `bookings:read:own` + `booking.userId === session.id` |
| Read/update all bookings | `bookings:read`/`bookings:update` (staff) |
| Manage bookings (cancel/refund-level) | `bookings:manage` (MANAGER+) |
| Profile read/update | `requireSelfOrAdmin(userId)` |
| Create review | `reviews:create` + booking ownership verified (prevent review spam by non-guests) |
| User admin (list/create/activate/deactivate) | `users:manage` (ADMIN+) |

`requireSelfOrAdmin` already exists in `session.ts`; the booking-ownership predicate is 🚧 (service layer, `08-API-Specification.md`).

---

## 7. Security Notes

- **Never trust the JWT role for authorization** (D-RBAC-3).
- Component-level checks are cosmetic; all mutations are re-authorized server-side.
- 403 responses are `{success:false, error:"Insufficient permissions", code:"FORBIDDEN"}` via `ForbiddenError` (`src/lib/errors/forbidden-error.ts`) — consistent envelope, no data leakage.
- After D-1, `ADMIN` losing `["*"]` must be verified against every admin-only route (regression checklist in `11-Testing.md`).

---

*End of Document 05. Next: `06-User-Profile.md`.*