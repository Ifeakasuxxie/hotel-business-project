# Document 03 — Database Design: Authentication & User Management

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, QA, Database Admin |
| **Source of truth** | `prisma/schema.prisma` (543 lines), `prisma/migrations/0_init/migration.sql`, `prisma/seed.ts` |
| **Depends on** | `01-Product-Overview.md` (D-1, D-2), `02-System-Architecture.md` |
| **Referenced by** | `05-Authorization-RBAC.md`, `06-User-Profile.md`, `08-API-Specification.md`, `11-Testing.md` |

**Status legend:** ✅ Implemented in the schema · 🚧 Planned (schema change required)

---

## 1. Purpose & Scope

### 1.1 Purpose of the authentication data model

The data model is the *single source of truth* for identity and access control across the platform. Every domain (bookings, payments, restaurant, reservations, notifications, auditing) relates back to `User`. Auth.js adapter tables (`Account`, `Session`, `VerificationToken`) integrate directly with Auth.js v5 so we never hand-roll session/token plumbing.

### 1.2 Design principles

1. **Prisma-native conventions** — table/column naming follows Prisma defaults (`camelCase` columns, `"Model"` table names), explicitly stated in the schema header comment.
2. **UUID primary keys** — all PKs are `String @id @default(uuid())`, generated application-side (PostgreSQL has no `uuid_generate_v4` dependency).
3. **Enum-based domain values** — state machines (roles, departments, employment status) are Postgres enums, not magic strings.
4. **Referential integrity enforced by the DB** — FKs use explicit `onDelete` semantics (`Restrict`/`Cascade`/`SetNull`).
5. **Soft state over hard deletes where FKs require it** — `User.isActive` supports deactivation without breaking child FK references.
6. **JSON for flexible payloads** — `AuditLog.before/after`, `Notification.data` use `Json` for unstructured detail.

### 1.3 Current implementation (✅)

| Component | Models | Status |
|---|---|---|
| Identity | `User` | ✅ |
| Roles & permissions | `Role` (`permissions String[]`) | ✅ |
| Auth.js OAuth adapter | `Account` | ✅ |
| Auth.js session adapter | `Session` | ✅ (reserved; JWT strategy is active) |
| Email/reset tokens | `VerificationToken` | ✅ |
| Staff records | `Staff` | ✅ |
| Audit | `AuditLog` | ✅ (model only; write wiring 🚧) |
| Notifications | `Notification` | ✅ (model only; wiring 🚧) |

### 1.4 Planned additions (🚧)

| Addition | Purpose |
|---|---|
| `SUPER_ADMIN` enum value (D-1) | Top-tier role; requires enum change + seed update |
| Remove `CONCIERGE` enum value (D-1) | Migrate to `STAFF` + `CONCIERGE` specialization |
| Specialization permission catalog | Data-driven grants per `StaffDepartment` (D-2) |
| MFA fields (`totpSecret`, `totpEnabled`) | Future TOTP support |
| Login history / security events | Login attempt tracking, device trust |
| Multi-tenant `Hotel` (per branch) | Future multi-branch support |
| User preferences / notification settings | Per-user config |

> **Not present (by design):** There is **no** separate `PasswordResetToken` table and **no** `UserPermission` override table. Password-reset tokens reuse the Auth.js `VerificationToken` table (🚧 flow in `04-Authentication.md`). Role grants are stored on `Role.permissions: String[]` — per-user permission overrides are a deliberate non-goal (see Decision Record §13).

---

## 2. ER Diagram

```mermaid
erDiagram
    User ||--|| Role : "roleId (Restrict)"
    User ||--o{ Account : "userId (Cascade)"
    User ||--o{ Session : "userId (Cascade)"
    User ||--o| Staff : "userId (Cascade)"
    User ||--o{ AuditLog : "userId (SetNull)"
    User ||--o{ Notification : "userId (Cascade)"

    Role ||--o{ User : ""

    User {
        string id PK, uuid
        string roleId FK
        string firstName
        string lastName
        string name
        string email UK
        string phone "nullable"
        string passwordHash
        boolean emailVerified "default false"
        string image "nullable"
        boolean isActive "default true"
        datetime createdAt
        datetime updatedAt
    }

    Role {
        string id PK, uuid
        UserRole name UK
        string description "nullable"
        string[] permissions
        datetime createdAt
        datetime updatedAt
    }

    Account {
        string id PK, uuid
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token "nullable"
        string access_token "nullable"
        int expires_at "nullable"
        string token_type "nullable"
        string scope "nullable"
        string id_token "nullable"
        string session_state "nullable"
    }

    Session {
        string id PK, uuid
        string sessionToken UK
        string userId FK
        datetime expires
    }

    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }

    Staff {
        string id PK, uuid
        string userId FK, UK
        string position
        StaffDepartment department
        datetime hireDate "db.Date"
        EmploymentStatus employmentStatus "default ACTIVE"
        string bio "nullable"
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        string id PK, uuid
        string userId "nullable, FK"
        string action
        string entityType
        string entityId "nullable"
        json before "nullable"
        json after "nullable"
        string ipAddress "nullable"
        string userAgent "nullable"
        datetime createdAt
    }

    Notification {
        string id PK, uuid
        string userId FK
        NotificationType type
        string title
        string message "nullable"
        json data "nullable"
        boolean isRead "default false"
        datetime readAt "nullable"
        datetime createdAt
    }
```

> Note: `Account`, `Session`, and `VerificationToken` are not currently linked by `@relation` in the schema — they are standalone tables consumed by `@auth/prisma-adapter`. This is the standard Auth.js adapter arrangement.

---

## 3. Model-by-Model Documentation

---

### Model: `User`

#### Purpose
The canonical identity record. Every guest account, staff member, manager, and administrator is a `User` row. All domain models (bookings, orders, reviews, reservations, notifications, audit logs) hang off `User.id`.

#### Responsibilities
- Hold credentials (`passwordHash`), identity fields, and account state.
- Reference the granted role via `roleId`.
- Act as the owner/FK anchor for all user-scoped domain data.

#### Fields

| Field | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `String` | — | `uuid()` | PK |
| `roleId` | `String` | — | — | FK → `Role.id` |
| `firstName` | `String` | — | — | Required |
| `lastName` | `String` | — | — | Required |
| `name` | `String` | — | — | Denormalized display name (`"First Last"`); kept in sync with first/last |
| `email` | `String` | — | — | **Unique**; login identifier |
| `phone` | `String?` | ✅ | — | Optional |
| `passwordHash` | `String` | — | — | bcrypt hash (cost 10); never returned by any API |
| `emailVerified` | `Boolean` | — | `false` | 🚧 email verification flow uses this |
| `image` | `String?` | ✅ | — | Avatar URL (future: Cloudinary) |
| `isActive` | `Boolean` | — | `true` | Soft-deactivate flag |
| `createdAt` | `DateTime` | — | `now()` | |
| `updatedAt` | `DateTime` | — | `@updatedAt` | Auto-updated |

#### Constraints
- PK: `id` (UUID)
- Unique: `email`
- FK: `roleId → Role.id`, **`onDelete: Restrict`** (a role with users cannot be deleted)

#### Relationships
- `role` (many-to-one → `Role`)
- `accounts` (one-to-many → `Account`, Cascade)
- `sessions` (one-to-many → `Session`, Cascade)
- `bookings`, `orders`, `reviews`, `tableReservations`, `poolReservations`, `eventReservations` (domain ownership)
- `notifications` (Cascade)
- `auditLogs` (SetNull)
- `staffProfile` (one-to-one → `Staff`, Cascade)

#### Indexes
- Unique index on `email` (from `@unique`)
- Index on `roleId` (auto-created by Prisma for the FK)

#### Business Rules
- Email is unique and is the credential identifier.
- Registration always creates a `CUSTOMER`-role user (see `04-Authentication.md`).
- `isActive=false` = account deactivated; login must reject deactivated accounts (🚧 enforce in `authorize`).
- `name` is denormalized; profile updates must keep `name` consistent with `firstName`/`lastName`.

#### Validation Rules
- Email format, password strength (≥ 8 chars, mixed case + digit per `registerUserSchema` in `src/lib/validations/user.ts`).
- First/last name non-empty; phone optional.

#### Soft Delete Behavior
- No hard delete by default. Deactivation via `isActive=false` preserves FK integrity with bookings/orders.
- Hard delete only considered for test/scrubbed data (admin tooling 🚧).

#### Audit Requirements
- Login, logout, password change, email change, role change, deactivation — all must write `AuditLog` rows (🚧 wiring).

#### Future Extensions
- `totpSecret`, `totpEnabled` (MFA 🚧)
- `preferredLanguage`, `timezone` (user preferences 🚧)
- `hotelId` (multi-tenant 🚧)

---

### Model: `Role`

#### Purpose
The RBAC grant table. Each row is a named role carrying a string-array of permission identifiers. Roles are the *data-driven* authorization source (see Decision Record §13 and `05-Authorization-RBAC.md`).

#### Responsibilities
- Define the permission set for each role.
- Reference users assigned to the role.
- Provide the extensible mechanism for staff specialization (D-2): specialization = role `STAFF` + a scoped permission grant.

#### Fields

| Field | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `String` | — | `uuid()` | PK |
| `name` | `UserRole` | — | — | **Unique** enum value |
| `description` | `String?` | ✅ | — | Human-readable description |
| `permissions` | `String[]` | — | — | Permission identifiers, e.g. `"bookings:create"` |
| `createdAt` | `DateTime` | — | `now()` | |
| `updatedAt` | `DateTime` | — | `@updatedAt` | |

#### Constraints
- PK: `id`
- Unique: `name` (enum)
- FK: none inbound from Role; `User.roleId` references it

#### Relationships
- `users` (one-to-many → `User`)

#### Indexes
- Unique index on `name`

#### Business Rules
- `name` must be a member of the `UserRole` enum.
- `permissions` array may contain `"*"` (wildcard) for `ADMIN`/`SUPER_ADMIN`.
- A role referenced by ≥1 user cannot be deleted (`onDelete: Restrict`).

#### Validation Rules
- Permission identifiers follow `<resource>:<action>` (optionally `:own`/`<scope>`).
- No duplicate entries within a role's array.

#### Soft Delete Behavior
- N/A (roles are not soft-deleted; they are re-seeded/updated).

#### Audit Requirements
- Permission changes on any role must be audited (🚧).

#### Future Extensions
- `SUPER_ADMIN` row (D-1).
- Possible `parentRoleId` for role inheritance — currently **not** implemented (no inheritance; see §13).

---

### Model: `Account` (Auth.js adapter)

#### Purpose
Auth.js OAuth-account linking table. Maps a user to one or more OAuth provider identities. Currently unused (no OAuth providers enabled) but present for adapter compatibility and future Google/GitHub login.

#### Fields

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `String` | — | PK |
| `userId` | `String` | — | FK → `User.id` (Cascade) |
| `type` | `String` | — | `"oauth"` / `"email"` / `"credentials"` |
| `provider` | `String` | — | e.g. `"google"` |
| `providerAccountId` | `String` | — | Provider-side ID |
| `refresh_token` | `String?` | ✅ | |
| `access_token` | `String?` | ✅ | |
| `expires_at` | `Int?` | ✅ | Unix seconds |
| `token_type` | `String?` | ✅ | |
| `scope` | `String?` | ✅ | |
| `id_token` | `String?` | ✅ | |
| `session_state` | `String?` | ✅ | |

#### Constraints
- PK: `id`
- Composite unique: `@@unique([provider, providerAccountId])`
- FK: `userId → User.id` (Cascade)

#### Indexes
- Composite unique `(provider, providerAccountId)` — also serves provider lookups.

#### Business Rules
- Deleting a user cascades to their accounts.
- Not used by the current JWT/credentials flow; required by `@auth/prisma-adapter` for OAuth.

#### Security Considerations
- `access_token`/`refresh_token`/`id_token` are OAuth tokens — sensitive. Never serialize to API responses. Consider application-level encryption (🚧) if OAuth lands.

---

### Model: `Session` (Auth.js adapter)

#### Purpose
Database session store used by Auth.js when session strategy is `database`. With the current **JWT strategy**, this table is reserved/unused by the runtime. It is the natural home for 🚧 device/session tracking and "logout all" if we switch strategy.

#### Fields

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `String` | — | PK |
| `sessionToken` | `String` | — | **Unique** |
| `userId` | `String` | — | FK → `User.id` (Cascade) |
| `expires` | `DateTime` | — | Session expiry |

#### Constraints
- PK: `id`
- Unique: `sessionToken`
- FK: `userId → User.id` (Cascade)

#### Indexes
- Unique `sessionToken`; index on `userId` (auto FK index).

#### Business Rules
- Deleting a user cascades their sessions.
- With JWT strategy, rows are only created if the adapter is asked to persist sessions — currently it isn't.

#### Security Considerations
- `sessionToken` must be high-entropy and treated as a credential.

---

### Model: `VerificationToken`

#### Purpose
Auth.js email-verification/token store (single-use, expiring). **Also the designated mechanism for password-reset tokens** (no separate `PasswordResetToken` table — see §13).

#### Fields

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `identifier` | `String` | — | The token's target (email address) |
| `token` | `String` | — | **Unique** — the hashed token |
| `expires` | `DateTime` | — | Expiry; unusable after this time |

#### Constraints
- Composite unique: `@@unique([identifier, token])`
- Unique: `token`

#### Indexes
- Unique `token`; composite unique `(identifier, token)`.

#### Business Rules
- Tokens are single-purpose and single-use (delete on consumption, or add a `usedAt`/`purpose` column 🚧 if both verify-email and reset-password flows share this table).
- Expiry is enforced at read time (`expires > now()`).
- Token values stored **hashed** (Auth.js hashes by default); never log or return.

#### Security Considerations
- Short TTL (15–60 min for resets 🚧).
- Rate-limit token issuance per identifier (🚧).

---

### Model: `Staff`

#### Purpose
Holds employment/operational attributes for staff-tier users (`STAFF`/`MANAGER`). Decouples *role* from *job details*; implements the D-2 specialization model.

#### Fields

| Field | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `String` | — | `uuid()` | PK |
| `userId` | `String` | — | — | FK → `User.id`, **unique** (one-to-one) |
| `position` | `String` | — | — | Job title, e.g. "Front Desk Agent" |
| `department` | `StaffDepartment` | — | — | Enum: `FRONT_DESK`, `HOUSEKEEPING`, `KITCHEN`, `RESTAURANT`, `MANAGEMENT`, `MAINTENANCE`, `SECURITY` |
| `hireDate` | `DateTime` | — | — | `@db.Date` (date only) |
| `employmentStatus` | `EmploymentStatus` | — | `ACTIVE` | `ACTIVE` / `ON_LEAVE` / `TERMINATED` |
| `bio` | `String?` | ✅ | — | Optional staff bio |
| `createdAt` | `DateTime` | — | `now()` | |
| `updatedAt` | `DateTime` | — | `@updatedAt` | |

#### Constraints
- PK: `id`
- Unique: `userId` (one-to-one)
- FK: `userId → User.id` (Cascade)

#### Indexes
- Unique `userId`.

#### Business Rules
- One `Staff` row per staff-tier user.
- `department` drives the specialization permission grant (D-2) — e.g. `FRONT_DESK` ⇒ `bookings:create`, `bookings:update`, `guests:check-in`, `reservations:manage`.
- `employmentStatus=TERMINATED` should deactivate the linked user account (🚧 sync rule).

#### Future Extensions
- New `StaffDepartment` values (`SPA`, `EVENTS`) as the hotel adds facilities (noted in `01-Product-Overview.md` §4.3).

---

### Model: `AuditLog`

#### Purpose
Immutable record of security-relevant and admin actions. Model exists in schema; **write wiring is 🚧** (`src/lib` has no audit helper yet).

#### Fields

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `String` | — | PK |
| `userId` | `String?` | ✅ | FK → `User.id` (SetNull — preserves log if user deleted) |
| `action` | `String` | — | e.g. `auth.login`, `user.update`, `role.permissions.change` |
| `entityType` | `String` | — | e.g. `"User"`, `"Booking"` |
| `entityId` | `String?` | ✅ | |
| `before` | `Json?` | ✅ | Snapshot before mutation |
| `after` | `Json?` | ✅ | Snapshot after mutation |
| `ipAddress` | `String?` | ✅ | |
| `userAgent` | `String?` | ✅ | |
| `createdAt` | `DateTime` | — | `now()` |

#### Constraints
- PK: `id`
- FK: `userId → User.id` (SetNull)
- Indexes: `@@index([entityType, entityId])`, `@@index([createdAt])`

#### Indexes
- Composite `(entityType, entityId)` — find all logs for a resource.
- `createdAt` — time-bucketed queries, retention jobs.

#### Business Rules
- Append-only: never UPDATE or DELETE audit rows in application code.
- `before`/`after` store PII for user/role events — minimize (mask emails?) and consider retention (🚧).

#### Security Considerations
- Restrict write access to the audit subsystem only; reads to `ADMIN`/`SUPER_ADMIN`.

---

### Model: `Notification`

#### Purpose
Per-user in-app notifications. Out of Phase 4 core scope but owned here because it is user-scoped and referenced by `User.notifications`.

#### Fields
`id` (PK), `userId` (FK, Cascade), `type` (`NotificationType` enum), `title`, `message?`, `data?` (Json), `isRead` (default `false`), `readAt?`, `createdAt`.

#### Indexes
- `@@index([userId, isRead])` — unread-notification inbox query.

#### Business Rules
- Full notification pipeline (creation, delivery, read-state) is 🚧 (later phase).

---

## 4. Authentication Data Flow

### 4.1 Register
```
POST /api/auth/register
  1. validate (registerUserSchema)
  2. userRepository.findByEmail(email)         → SELECT User WHERE email
  3. if exists → ConflictError (409)
  4. roleRepository.findByName(CUSTOMER)       → SELECT Role WHERE name
  5. passwordHash = bcrypt.hash(password, 10)
  6. userRepository.create({ ... , roleId, passwordHash })
       → INSERT User (emailVerified = false)
  7. [🚧] create VerificationToken + send email
  8. return 201 { user (sans passwordHash) }
```

### 4.2 Login
```
POST /api/auth/login → NextAuth credentials provider
  1. userRepository.findByEmail(email)         → SELECT User WHERE email
  2. if !user || !user.passwordHash → null (401)
  3. bcrypt.compare(password, passwordHash)
  4. [🚧] reject if !user.isActive or !user.emailVerified
  5. return { id, email, name, role }          → embedded into JWT
  6. Auth.js sets next-auth.session-token cookie
  7. [🚧] AuditLog: auth.login
```

### 4.3 Logout
```
POST /api/auth/logout → signOut()
  → clears session cookie
  → [🚧] AuditLog: auth.logout
```

### 4.4 Email verification (🚧 planned)
```
Register (step 7) → VerificationToken(identifier=email, token=hash, expires=+24h)
  → user clicks link /api/auth/verify-email?token=...
  → look up token (hash), check expires > now
  → UPDATE User SET emailVerified = true WHERE email = identifier
  → DELETE VerificationToken (single-use)
```

### 4.5 Password reset (🚧 planned — uses VerificationToken)
```
POST /api/auth/forgot { email }
  → if user exists: VerificationToken(identifier=email, token=hash, expires=+30m)
  → Resend email with /auth/reset?token=...
  → always return 200 (no account enumeration)
POST /api/auth/reset { token, newPassword }
  → verify token (single-use, not expired)
  → bcrypt.hash(newPassword, 10)
  → UPDATE User SET passwordHash WHERE email = identifier
  → DELETE token; revoke sessions ([🚧] Session rows / cookie clear)
```

### 4.6 Session validation (per request)
```
Middleware (Edge)
  → reads next-auth.session-token cookie
  → jose verify (no DB) → extracts sub/role
  → decides public/protected/401/redirect
Server (API / server component)
  → auth() → SessionUser { id, email, name, image, role }
```

### 4.7 Token refresh
- No sliding refresh today (JWT, fixed 30-day `maxAge`).
- 🚧 Planned: middleware re-issues a fresh JWT when `exp` is within a threshold; or switch to DB sessions.

---

## 5. Role & Permission Storage

### 5.1 `UserRole` enum (current, `prisma/schema.prisma`)

```prisma
enum UserRole {
  CUSTOMER
  STAFF
  MANAGER
  CONCIERGE
  ADMIN
}
```

**Target (D-1):**

```prisma
enum UserRole {
  CUSTOMER
  STAFF
  MANAGER
  ADMIN
  SUPER_ADMIN
}
```

### 5.2 Permission seeding (`prisma/seed.ts`)

| Role | Permissions (current) | Permissions (target, D-1/D-2) |
|---|---|---|
| `CUSTOMER` | `bookings:create`, `bookings:read:own`, `reviews:create` | unchanged |
| `STAFF` | `bookings:read`, `bookings:update`, `restaurant:manage` | base + specialization grants per `StaffDepartment` |
| `MANAGER` | `users:read`, `bookings:manage`, `payments:manage`, `reviews:manage` | + `staff:oversight` |
| `CONCIERGE` | `bookings:create`, `bookings:read`, `reservations:manage` | **removed** — merged into `STAFF` + specialization |
| `ADMIN` | `*` | `users:manage`, `hotel:configure`, `content:manage`, `pricing:manage` |
| `SUPER_ADMIN` | — | `*` (new row) |

### 5.3 Permission lookup strategy

- **Runtime (future, data-driven):** `roleRepository.findByName(user.role)` → `role.permissions` → check `includes(permission)` or `includes("*")`. Cache role rows (TTL or in-memory) to avoid a query per check (see §5.5).
- **Current compiled helpers (`src/lib/auth/roles.ts`):** `isAdmin`/`isStaff`/`isCustomer` use hard-coded sets — an approximation of the data model. Converge to data-driven checks in `05-Authorization-RBAC.md`.

### 5.4 Role inheritance

- **None implemented.** Roles are flat; `SUPER_ADMIN > ADMIN > MANAGER > STAFF > CUSTOMER` is a *policy* hierarchy, not a data-model inheritance graph. A `parentRoleId` self-relation is a possible future extension (see Decision Record §13) but is not present.

### 5.5 Caching strategy

| Layer | Current | Planned |
|---|---|---|
| Role rows | N/A (one query per guard when added) | In-memory cache with invalidation on role update; Redis for multi-instance |
| Permissions | Hard-coded helper sets | Data-driven; cached per `(role)` with TTL |
| JWT claims | Role value embedded in token | Keep `role` in JWT; do NOT embed full permission list (size) |

---

## 6. Constraints & Integrity

| Rule | Model(s) | `onDelete` | Rationale |
|---|---|---|---|
| Role → User | `User.roleId → Role.id` | **Restrict** | Never delete a role that has users |
| User → Account | `Account.userId` | **Cascade** | OAuth links die with the user |
| User → Session | `Session.userId` | **Cascade** | Sessions die with the user |
| User → Staff | `Staff.userId` | **Cascade** | One-to-one staff profile |
| User → AuditLog | `AuditLog.userId` | **SetNull** | Preserve audit trail after deletion |
| User → Notification | `Notification.userId` | **Cascade** | |
| Unique `User.email` | `User` | — | Login identity |
| Unique `Role.name` | `Role` | — | Enum-backed role identity |
| Unique `Session.sessionToken` | `Session` | — | |
| Unique `Account(provider, providerAccountId)` | `Account` | — | OAuth account uniqueness |
| Unique `VerificationToken.token` + `(identifier, token)` | `VerificationToken` | — | Token lookup + reuse prevention |
| Unique `Staff.userId` | `Staff` | — | One staff profile per user |

**Transaction boundaries:**
- Register: role lookup + user insert are logically atomic; wrap in `prisma.$transaction` when email-verification token insert is added (🚧).
- Reset password: token verify + password update + token delete + session revoke → single `$transaction` (🚧).

---

## 7. Indexing Strategy

| Model | Index | Purpose | Query pattern |
|---|---|---|---|
| `User` | UNIQUE `email` | O(1) login lookup | `findByEmail` on every login/register |
| `User` | `roleId` (auto FK) | Role→users and filtering | `findMany({ where: { roleId } })` for user lists |
| `Account` | UNIQUE `(provider, providerAccountId)` | OAuth lookup | adapter `getUserByAccount` |
| `Session` | UNIQUE `sessionToken` | Session validation (DB mode) | adapter `getSessionAndUser` |
| `VerificationToken` | UNIQUE `token`; UNIQUE `(identifier, token)` | Token verification | `findUnique({ where: { token } })` |
| `Staff` | UNIQUE `userId` | One-to-one join | `findUnique({ where: { userId } })` |
| `AuditLog` | `(entityType, entityId)`; `createdAt` | Resource/time audit queries | admin audit trails, retention jobs |

**Performance rationale:** Auth-critical lookups (`email`, `sessionToken`, `token`, `(provider, providerAccountId)`) are all unique-index scans. `AuditLog` is append-heavy and indexed on its two common query axes. No additional auth indexes are needed at current scale.

---

## 8. Security Considerations

| Area | Current | Planned (🚧) |
|---|---|---|
| **Password storage** | `bcryptjs` cost 10 hash in `passwordHash` | Consider native `argon2id` for future hardening |
| **Sensitive fields** | `passwordHash` excluded from all DTOs; OAuth tokens never serialized | Field-level encryption for `Account.access_token`/`refresh_token` |
| **Token storage** | `VerificationToken.token` hashed (Auth.js default); `sessionToken` unique | — |
| **PII handling** | `email`, `firstName`, `lastName`, `phone` are PII | Minimize audit `before/after` payloads; retention policy |
| **Data minimization** | JWT carries only `id/email/name/image/role`; `AuditLog` stores only relevant snapshots | — |
| **Audit logging** | Model exists | Wire auth events into `AuditLog` |
| **Enum integrity** | Postgres enums reject invalid role/status values at DB level | — |
| **Account enumeration** | Register returns 409 on existing email (product-visible); login error is generic | Rate-limit + delayed hashing for reset endpoint |

---

## 9. Migration Strategy

### 9.1 Current migrations
- `prisma/migrations/0_init/migration.sql` — the single baseline migration (full schema). No later migrations yet.

### 9.2 Workflow
- **Dev:** `npm run db:migrate` (`prisma migrate dev`) — creates a new migration, applies it, regenerates client.
- **Prod/CI (future):** `prisma migrate deploy`.
- **Generate only:** `npm run db:generate` (regenerates client without applying).
- **No-db push:** `npm run db:push` (for prototyping; not for migration history).

### 9.3 Naming convention
Prisma default: `<timestamp>_<name>/migration.sql` (e.g. `20260805_add_super_admin/migration.sql`). Name migrations after intent (`add_super_admin_role`, `seed_specialization_permissions`).

### 9.4 Rollback approach
- Prisma has no built-in `down`; rollback = apply the reverse SQL manually or restore from backup, then `prisma migrate resolve`.
- Keep migrations **additive** (new tables/columns/enum values, nullable or defaulted) to make rollback trivial and avoid data loss.

### 9.5 Safe schema evolution
- Enum additions are safe (append values). **Enum removals are breaking** — `CONCIERGE` removal (D-1) requires: (1) migrate existing `CONCIERGE` users → `STAFF` + specialization permission; (2) drop the enum value in a migration after data fix.
- Adding a nullable column / defaulted column = safe.
- Changing `onDelete` semantics = rewrite FK in a migration.

### 9.6 Zero-downtime (planned)
- Prefer `CREATE ... IF NOT EXISTS` / backfill pattern for large tables.
- For production: additive migration → deploy code → backfill script → switch. Relevant at Phase 9 scale, not required for Phase 4.

---

## 10. Seed Strategy (`prisma/seed.ts`)

### 10.1 Roles & permissions
- Upserts the five role rows (`CUSTOMER`, `STAFF`, `MANAGER`, `CONCIERGE`, `ADMIN`) with the permission sets in §5.2.
- Idempotent (`upsert` on `name`).

### 10.2 Admin bootstrap
- Creates `admin@thekingshotel.com` (from `SEED_ADMIN_EMAIL`), password `Admin123!` (from `SEED_ADMIN_PASSWORD`, bcrypt cost 10), `emailVerified: true`, role `ADMIN`.
- Idempotent (skips if email exists).

### 10.3 Development seed data
- Beyond roles + admin, no auth-specific dev fixtures exist. Add sample `CUSTOMER` + `STAFF` (per specialization) fixtures for testing 🚧.

### 10.4 Production initialization
- `npm run db:migrate` (deploy migrations) → `npm run db:seed`.
- 🚧 Target: seed `SUPER_ADMIN` (`superadmin@thekingshotel.com`) and the revised role matrix; rotate default credentials on first login.

---

## 11. Future Database Extensions (🚧)

All of the following require schema changes and are intentionally separated from the current model:

| Extension | Schema change |
|---|---|
| **Multi-tenant hotels** | `Hotel` model (`id`, `name`, `branchCode`); `User.hotelId` FK; `Role` scoping or per-hotel roles |
| **OAuth provider expansion** | None required — `Account` supports multiple providers today; add provider config in Auth.js |
| **MFA (TOTP)** | `User.totpSecret?`, `User.totpEnabled Boolean @default(false)`; optional `MfaBackupCode` model |
| **Device / login history** | `LoginHistory` model (`userId`, `ip`, `userAgent`, `geo`, `success`, `at`) or extend `Session` |
| **Security events** | `SecurityEvent` model (`type`, `userId?`, `meta Json`, `severity`) |
| **User preferences** | `UserPreferences` model (`userId` UK, `language`, `timezone`, `marketingOptIn`) |
| **Notification settings** | `NotificationPreference` model (`userId`, `type`, `channel`, `enabled`) |
| **Role inheritance** | `Role.parentRoleId?` self-relation |
| **User permission overrides** | `UserPermission` join table (`userId`, `permission`, `effect`) — see Decision Record §13 |

---

## 12. Appendix

### 12.1 Data dictionary (auth models)

| Model | PK | Unique | Key FKs |
|---|---|---|---|
| `User` | `id` | `email` | `roleId` |
| `Role` | `id` | `name` | — |
| `Account` | `id` | `(provider, providerAccountId)` | `userId` |
| `Session` | `id` | `sessionToken` | `userId` |
| `VerificationToken` | — *(no PK)* | `token`, `(identifier, token)` | — |
| `Staff` | `id` | `userId` | `userId` |
| `AuditLog` | `id` | — | `userId` (nullable) |
| `Notification` | `id` | — | `userId` |

### 12.2 Enum definitions

| Enum | Values |
|---|---|
| `UserRole` (current) | `CUSTOMER`, `STAFF`, `MANAGER`, `CONCIERGE`, `ADMIN` |
| `UserRole` (target, D-1) | `CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`, `SUPER_ADMIN` |
| `StaffDepartment` | `FRONT_DESK`, `HOUSEKEEPING`, `KITCHEN`, `RESTAURANT`, `MANAGEMENT`, `MAINTENANCE`, `SECURITY` |
| `EmploymentStatus` | `ACTIVE`, `ON_LEAVE`, `TERMINATED` |
| `NotificationType` | `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `ORDER_UPDATE`, `RESERVATION_CONFIRMED`, `PROMOTION`, `SYSTEM` |

### 12.3 Constraint summary
- 2 × `Restrict` deletes: `User.roleId`, domain models vs `User` (bookings/orders/reviews/reservations).
- 4 × `Cascade` deletes: `Account`, `Session`, `Staff`, `Notification`.
- 1 × `SetNull`: `AuditLog.userId`.
- 6 unique constraints across auth models (see §6).

### 12.4 Index summary
- `User.email` (unique), `User.roleId` (FK)
- `Account(provider, providerAccountId)` (unique)
- `Session.sessionToken` (unique)
- `VerificationToken.token` (unique), `(identifier, token)` (unique)
- `Staff.userId` (unique)
- `AuditLog(entityType, entityId)`, `AuditLog(createdAt)`
- `Notification(userId, isRead)`

### 12.5 Relationship summary
```
User 1─* Account          (Cascade)
User 1─* Session          (Cascade)
User 1─1 Staff            (Cascade)
User 1─* AuditLog         (SetNull)
User 1─* Notification     (Cascade)
User *─1 Role             (Restrict)
```

---

## 13. Decision Record

### D-DB-1 — No `PasswordResetToken` table
- **Options:** (a) dedicated table; (b) reuse `VerificationToken` with a `purpose` discriminator.
- **Decision:** (b) — reuse `VerificationToken`, add `purpose` (`EMAIL_VERIFY` / `PASSWORD_RESET`) and `usedAt` columns when the flows are built 🚧. Fewer tables, Auth.js-compatible.
- **Status:** Planned implementation detail.

### D-DB-2 — No `UserPermission` override table
- **Options:** (a) per-user overrides; (b) role-level grants only.
- **Decision:** (b) — role-level grants via `Role.permissions`. Overrides add combinatorial complexity with little current benefit; revisit if a single user needs exceptional grants.
- **Status:** Resolved (aligned with D-2).

### D-DB-3 — Role inheritance (`parentRoleId`)
- **Options:** (a) flat roles + policy hierarchy (`SUPER_ADMIN`→`CUSTOMER`); (b) self-referential `Role.parentRoleId` for inherited permission sets.
- **Decision:** (a) for Phase 4 — hierarchy is enforced in guards (`roles.ts` sets), not the schema. Option (b) is a clean future extension if permission sets grow.
- **Status:** Open (deferred).

### D-DB-4 — `CONCIERGE` removal migration (D-1)
- **Options:** (a) drop value in one migration (breaking); (b) two-step: data migration (CONCIERGE users → `STAFF` + concierge specialization grants), then enum change.
- **Decision:** (b) two-step, additive-safe. **Status:** Required before `SUPER_ADMIN` ships.

---

*End of Document 03. Next: `04-Authentication.md`.*