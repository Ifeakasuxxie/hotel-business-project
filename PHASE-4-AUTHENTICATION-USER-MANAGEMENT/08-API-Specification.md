# Document 08 — API Specification

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, QA, Frontend, External integrators |
| **Source of truth** | `src/app/api/**/route.ts`, `src/lib/validations/*`, `src/lib/utils/api-response.ts`, `src/lib/types/{api-response,dto,pagination}.ts`, `src/middleware.ts` |
| **Depends on** | `04-Authentication.md`, `05-Authorization-RBAC.md`, `07-Security.md` |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Conventions

### 1.1 Base URL
- Dev: `http://localhost:3000/api`
- Prod (assumed): `https://thekingshotel.com/api` — confirm with DNS team.

### 1.2 Authentication
- **Cookie-based session** (Auth.js `next-auth.session-token`). There is **no Bearer-token support** today.
- Mobile/native clients (🚧): token strategy to be designed (OAuth or session-based) in Phase 9.

### 1.3 Response envelope (`src/lib/utils/api-response.ts`)

**Success (200 / 201):**
```json
{ "success": true, "data": { ... } }            // optional "message"
```

**Success (204):** empty body (`POST /api/auth/logout`).

**Failure — uniform, no stack traces:**
```json
{ "success": false, "error": "<message>", "code": "UNAUTHORIZED" }
```
`details` may carry zod `fieldErrors` on validation failures (400).

### 1.4 Status codes
| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created (`register`, `POST /api/users`, `POST /api/bookings`, …) |
| 204 | No content (`logout`) |
| 400 | Validation error (`VALIDATION_ERROR`) |
| 401 | Missing/invalid session (`UNAUTHORIZED`) |
| 403 | Authenticated but insufficient role (`FORBIDDEN`) |
| 404 | Not found (`NOT_FOUND`) |
| 409 | Conflict — duplicate email (`CONFLICT`) |
| 501 | Not implemented (`NOT_IMPLEMENTED`) — e.g. `/api/contact` |

### 1.5 Errors
Full taxonomy in `07-Security.md` §2. All routes are wrapped in `withErrorHandler`; mutation routes additionally use `withValidation(schema)`.

### 1.6 Versioning
- **No `/v1` prefix** and no version headers today.
- **Decision (D-API-1):** keep unversioned for Phase 4 (internal app, single consumer); introduce `/v1` when a public consumer appears. Breaking changes get a co-deployed new route group, not header negotiation.

### 1.7 Pagination
Query params `page` (1-based, default 1) and `pageSize` (default 20) via `paginationSchema`. Response shape (`src/lib/types/pagination.ts`):
```json
{ "items": [], "total": 0, "page": 1, "pageSize": 20, "totalPages": 1 }
```

---

## 2. Phase-4 Core Endpoints

### 2.1 `POST /api/auth/register`

Create a customer account.

**Body (`registerUserSchema`):**
```json
{
  "firstName": "John", "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",        // optional, 7–20 chars
  "password": "SecurePass123",      // 8–128, lower+upper+digit
  "confirmPassword": "SecurePass123"
}
```

**Success:** `201` → `{ success: true, data: AuthUserDto, message: "Account created" }`
**Errors:** 400 validation · 409 duplicate email · 404 default role unconfigured
**Side effects:** bcrypt hash (cost 10); no session minted.

### 2.2 `POST /api/auth/login`

**Body (`loginSchema`):** `{ "email": "…", "password": "…" }`

**Flow:** `authService.login` validates → `signIn("credentials", …, { redirect: false })` mints session cookie → respond.

**Success:** `200` → `{ success: true, data: AuthUserDto, message: "Signed in" }` + `Set-Cookie`.
**Errors:** 400 validation · 401 `"Invalid email or password"` (unknown user / inactive / wrong password).

### 2.3 `POST /api/auth/logout`

No body. Clears session cookie via `signOut({ redirect: false })`.

**Success:** `204` (empty).
**Errors:** none (idempotent).

### 2.4 `GET /api/auth/me`

Returns the current user from **DB** (fresh role, `isActive` enforced).

**Success:** `200` → `{ success: true, data: AuthUserDto }`
**Errors:** 401 no/invalid session · 401 user missing or deactivated.

### 2.5 `GET/POST /api/auth/[...nextauth]`

Auth.js framework endpoints (sign-in page flow, CSRF token, session provider). Used by `next-auth/react` client and middleware. Not part of our envelope — Auth.js native responses.

### 2.6 `GET /api/profile`

`profileService.getProfile()` → `userService.getById(session.id)`.

**Success:** `200` → `{ success: true, data: UserProfileDto }`
**Errors:** 401 unauthenticated.

### 2.7 `PUT /api/profile`

Update own profile. **Self-only** (session id fixed).

**Body (`updateProfileSchema`)** — all optional, `phone`/`image` nullable:
```json
{ "firstName": "John", "lastName": "Doe", "phone": null, "image": "https://…" }
```

**Success:** `200` → `{ success: true, data: UserProfileDto, message: "Profile updated" }`
**Errors:** 400 validation · 401 unauthenticated.
**Not editable:** email (immutable), role, `isActive`.

### 2.8 `GET /api/users` — **ADMIN** (ADMIN|MANAGER)

Paginated user list.

**Query:** `page`, `pageSize`.
**Success:** `200` → `{ success: true, data: Paginated<UserDto> }`
**Errors:** 401 · 403 (non-admin).

### 2.9 `POST /api/users` — **ADMIN** (ADMIN|MANAGER)

Create any user (staff/admin/customer).

**Body (`createUserSchema`):** firstName, lastName, email, phone?, password, `role` ∈ {CUSTOMER, STAFF, ADMIN, MANAGER, CONCIERGE}.
**Success:** `201` → `{ success: true, data: UserDto, message: "User created" }`
**Errors:** 400 · 401 · 403 · 409 duplicate email · 404 role unconfigured.

### 2.10 `GET /api/users/:id` — self **or** ADMIN|MANAGER

**Success:** `200` → `{ success: true, data: UserProfileDto }`
**Errors:** 400 invalid id · 401 · 404 (also returned when self-accessing a different account → `requireSelfOrAdmin` throws 401 `"You can only access your own account"`).

### 2.11 `PATCH /api/users/:id` — self **or** ADMIN|MANAGER

**Body (`updateUserSchema`):** firstName?, lastName?, `name`?, phone?, image?, `isActive`?.
**Success:** `200` → `{ success: true, data: UserProfileDto, message: "User updated" }`
**Errors:** 400 · 401 · 403 · 404.
**Cannot change:** email, role (not in schema — D-PROF-2).

### 2.12 `DELETE /api/users/:id` — **ADMIN**

**Effect:** soft-deactivate (`isActive = false`). Row retained.
**Success:** `200` → `{ success: true, data: { id }, message: "User deactivated" }`
**Errors:** 400 · 401 · 403 · 404.

---

## 3. Planned Phase-4 Endpoints (🚧)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/forgot` | POST | public | Send reset token (always 200) |
| `/api/auth/reset` | POST | public (token) | Consume reset token, set new password |
| `/api/auth/verify-email` | POST | public (token) | Verify email |
| `/api/auth/verify-email/resend` | POST | session | Re-issue verification token (rate-limited) |
| `/api/profile/change-password` | POST | session | Wraps existing `authService.changePassword` |
| `/api/profile/email` | POST | session | Email-change with re-verification (D-PROF-2) |
| `/api/auth/mfa/setup` / `/verify` / `/disable` | POST | session / step-up | TOTP enrollment & login step-up |
| `/api/auth/logout-all` | POST | session | Revoke all sessions (tokenVersion) |

Schemas: `forgotPasswordSchema` (email), `resetPasswordSchema` (token + password + confirm), `verifyEmailSchema` (token).

---

## 4. Adjacent APIs (outside Phase-4 scope — authorization expectations)

Middleware `PROTECTED_APIS` gate the following mutating endpoints (401 if unauthenticated). In-handler role enforcement is being completed during Phase 4 wiring.

| Resource | Endpoint | Public | Protected (middleware) | Notes |
|---|---|---|---|---|
| Bookings | `GET /api/bookings` | — | — | 🚧 calls `listForUser("")` — not yet wired to session user (gap) |
| Bookings | `POST /api/bookings` | — | ✅ | CUSTOMER/STAFF |
| Bookings | `PATCH /api/bookings/:id` | — | — | Ownership/staff rule 🚧 |
| Payments | `POST /api/payments` | — | ✅ | CUSTOMER |
| Payments | `GET/PATCH /api/payments/:id` | — | — | Own/`payments:manage` 🚧 |
| Reviews | `GET /api/reviews?roomId=` | ✅ | — | Approved only |
| Reviews | `POST /api/reviews` | — | ✅ | CUSTOMER, booking-owned |
| Reviews | `PATCH /api/reviews/:id` | — | — | `reviews:manage` (moderation) |
| Restaurant | `GET /api/restaurant/menu*` | ✅ | — | Public menu |
| Restaurant | `POST /api/restaurant/orders` | — | ✅ | CUSTOMER |
| Rooms | `GET /api/rooms*` | ✅ | — | Public |
| Reservations | `POST /api/reservations/{event,pool,table}` | ✅ | — | Public inquiries (🚧 auth optional) |
| Contact | `POST /api/contact` | ✅ | — | Returns 501 `NOT_IMPLEMENTED` |
| Health | `GET /api/health` | ✅ | — | `{ status: "ok", timestamp }` |

---

## 5. DTOs (source: `src/lib/types/dto.ts`)

| DTO | Fields |
|---|---|
| `AuthUserDto` | id, firstName, lastName, name, email, image, **role** (string) |
| `UserProfileDto` | id, firstName, lastName, name, email, phone, image, emailVerified, **role?** |
| `UserDto` | id, firstName, lastName, name, email, phone, roleId, isActive, **role?** |
| `Paginated<T>` | items, total, page, pageSize, totalPages |

`AuthUserDto` is used for register/login/me (role always present). `UserProfileDto` for profile read/update and user-by-id. **No DTO ever contains `passwordHash`.**

---

## 6. Auth-Z / Ownership Matrix (Phase-4 endpoints)

| Endpoint | Guest | CUSTOMER | STAFF | MANAGER | ADMIN |
|---|---|---|---|---|---|
| `POST /api/auth/register` | ✅ | — | — | — | — |
| `POST /api/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/auth/logout` | ✅* | ✅ | ✅ | ✅ | ✅ |
| `GET /api/auth/me` | ❌ 401 | ✅ | ✅ | ✅ | ✅ |
| `GET/PUT /api/profile` | ❌ 401 | ✅ own | ✅ own | ✅ own | ✅ own |
| `GET /api/users` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ | ✅ |
| `POST /api/users` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ | ✅ |
| `GET/PATCH /api/users/:id` | ❌ 401 | ✅ own only | ✅ own only | ✅ own or any | ✅ own or any |
| `DELETE /api/users/:id` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ | ✅ |

\* Logout is idempotent and safe without a session.

---

## 7. API Decision Record

### D-API-1 — No version prefix
Unversioned for Phase 4; add `/v1` when a public/mobile consumer lands.

### D-API-2 — Cookie sessions over bearer tokens
Auth.js JWT cookie is the only auth mechanism. Adding bearer tokens (for native apps) is Phase 9.

### D-API-3 — Envelope everywhere, framework endpoints excepted
Our routes use `ApiResponse` uniformly; Auth.js `[...nextauth]` keeps native semantics (consumed by the client library, not app code).

### D-API-4 — Soft delete on users
`DELETE /api/users/:id` never hard-deletes (D-PROF-4). Semantics documented to avoid frontend surprises.

---

*End of Document 08. Next: `09-Frontend-Architecture.md`.*