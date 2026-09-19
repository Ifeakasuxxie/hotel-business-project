# Document 13 — Acceptance Criteria

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering / QA |
| **Audience** | Engineering, QA, Product |
| **Source of truth** | Documents 01–12 (this is the consolidated verification contract) |
| **Referenced by** | All implementation milestones (M1–M10) |

**Legend:** ✅ Verified in current code · ⬜ Planned (must pass by Phase-4 release)

Test types: **U** unit · **I** integration · **E** E2E · **M** manual · **S** security

---

## 1. Authentication

| # | Criterion | Type | Status |
|---|---|---|---|
| A-1 | `POST /api/auth/register` with valid body returns `201` + `AuthUserDto`, no `passwordHash` in body | I/S | ✅ |
| A-2 | Register with an existing email returns `409 CONFLICT` (case-insensitive) | I | ✅ |
| A-3 | Register rejects invalid payloads with `400 VALIDATION_ERROR`; password must be 8–128 + lower + upper + digit | U/I | ✅ |
| A-4 | `confirmPassword` mismatch is rejected | U/I | ✅ |
| A-5 | Registration does **not** create a session (user must log in) | I | ✅ |
| A-6 | `POST /api/auth/login` with valid creds returns `200` + `AuthUserDto` + session cookie | I/E | ✅ |
| A-7 | Login error message is identical for unknown-user / inactive / wrong-password | S | ✅ |
| A-8 | Login for a deactivated account (`isActive=false`) returns `401` | I/S | ✅ |
| A-9 | `POST /api/auth/logout` returns `204` and clears the session cookie | I/E | ✅ |
| A-10 | `GET /api/auth/me` returns fresh DB role; `401` without session | I | ✅ |
| A-11 | Session cookie is HttpOnly + SameSite=Lax (+ Secure in prod) | S | ✅ |
| A-12 | Unverified emails are blocked at login once verification ships | S | ⬜ |
| A-13 | Email verification via single-use token; expires within 24h | I/E | ⬜ |
| A-14 | `POST /api/auth/forgot` always returns `200` (no enumeration) and mints a 30-min single-use reset token | I/S | ⬜ |
| A-15 | Password reset succeeds only with a valid, unused, unexpired token; sessions invalidated | I | ⬜ |
| A-16 | Change-password validates current password; wrong current → `401`; rehash cost 10 | U/I | ⬜ (service ✅) |
| A-17 | Login/register/forgot are rate-limited (in-memory window) | S | ⬜ |
| A-18 | MFA (TOTP) enroll/verify/disable for opt-in accounts; step-up at login | E | ⬜ |
| A-19 | `logout-all` revokes all sessions via `tokenVersion` | I | ⬜ |

## 2. Authorization / RBAC

| # | Criterion | Type | Status |
|---|---|---|---|
| R-1 | `requireAuth` throws 401 without session; `requireRole/requireStaff/requireAdmin` throw 403 on wrong role | U | ✅ |
| R-2 | `requireSelfOrAdmin` allows self and ADMIN/MANAGER only; other user → 401 | U/I | ✅ |
| R-3 | `isStaff/isAdmin/isCustomer/isStaffOrAdmin` truth tables match role sets | U | ✅ |
| R-4 | `requirePermission` evaluates `["*"]` wildcard and exact strings from **DB** role (not JWT) | U/I | ⬜ |
| R-5 | All service mutations re-check authz (never rely on client/JWT only) | S | ⬜ |
| R-6 | `SUPER_ADMIN` added with `["*"]`; `ADMIN` narrowed to `users:manage, hotel:configure, content:manage, pricing:manage` | I | ⬜ |
| R-7 | `CONCIERGE` removed from `UserRole`; prior users → `STAFF` + `CONCIERGE` `StaffDepartment` | I | ⬜ |
| R-8 | `requireAdmin` narrows to SUPER_ADMIN|ADMIN (MANAGER demoted) — no admin surface silently loses/gains access | S | ⬜ |
| R-9 | Role/permission changes take effect immediately (`/api/auth/me` re-reads DB) | I | ✅ |
| R-10 | Ownership rules enforced: own-bookings read, booking-owned review creation | I | ⬜ |

## 3. Profile & User Management

| # | Criterion | Type | Status |
|---|---|---|---|
| P-1 | `GET /api/profile` returns `UserProfileDto` (incl. emailVerified, role) | I | ✅ |
| P-2 | `PUT /api/profile` persists firstName/lastName/phone/image; email immutable | I | ✅ |
| P-3 | Profile page loads, edits, shows role badge, signs out; 401 shows "Go to Sign In" | E | ✅ |
| P-4 | `GET /api/users` (admin) paginates via `page`/`pageSize`; non-admin → 403 | I | ✅ |
| P-5 | `POST /api/users` (admin) creates users with role ∈ {CUSTOMER, STAFF, ADMIN, MANAGER, CONCIERGE→post-migration set} | I | ✅ |
| P-6 | `PATCH /api/users/:id` self-or-admin; cannot change email or role | I | ✅ |
| P-7 | `DELETE /api/users/:id` (admin) soft-deactivates; deactivated user blocked at login | I | ✅ |
| P-8 | Change-password UI on profile page (endpoint + form + toggle) | E | ⬜ |
| P-9 | Admin `/admin/users` console: list/create/edit/deactivate with permission-aware controls | E | ⬜ |

## 4. Security

| # | Criterion | Type | Status |
|---|---|---|---|
| S-1 | Uniform error envelope; unexpected errors → `500 INTERNAL_ERROR`, no stack traces | I/S | ✅ |
| S-2 | Error classes map to correct HTTP: 400/401/403/404/409/501/500 | U | ✅ |
| S-3 | No `passwordHash` in any response | S | ✅ |
| S-4 | `x-request-id` set on middleware-matched requests | I | ✅ |
| S-5 | Security headers present in prod responses (frame/nosniff/referrer/permissions/HSTS) | S | ⬜ |
| S-6 | Zod whitelist prevents mass-assignment (no `role`/`email` via `updateUserSchema`) | S | ✅ |
| S-7 | Audit log rows written for auth events with ip/userAgent/x-request-id | I/S | ⬜ |
| S-8 | Dependabot/audit clean at release | S | ⬜ |

## 5. API Contract

| # | Criterion | Type | Status |
|---|---|---|---|
| C-1 | Envelope shapes match `ApiResponse<T>` for all Phase-4 routes | I | ✅ |
| C-2 | `AuthUserDto`/`UserProfileDto`/`UserDto` field sets match `src/lib/types/dto.ts` | U | ✅ |
| C-3 | Middleware: unauthenticated protected API → exact `{success:false, error:"Authentication required", code:"UNAUTHORIZED"}` 401 | I | ✅ |
| C-4 | Middleware: unauthenticated protected page → `302 /login?next=<path>` | I/E | ✅ |
| C-5 | `/api/bookings` GET is wired to the session user (fix `listForUser("")`) | I | ⬜ |
| C-6 | Planned endpoints exist and conform: verify-email, forgot, reset, change-password, mfa, logout-all | I | ⬜ |

## 6. Frontend / UX

| # | Criterion | Type | Status |
|---|---|---|---|
| F-1 | Login restores `?next=` after sign-in; `?registered=1` shows success banner | E | ✅ |
| F-2 | Navbar reflects auth state without flicker (loading → authed/guest) | E | ✅ |
| F-3 | Staff-only Dashboard link hidden for customers; Profile + Sign Out for authed users | E | ✅ |
| F-4 | Role label mapping shared (D-FE-2) and consistent after role changes | U/E | ⬜ |
| F-5 | Per-field validation errors rendered (RHF + zod) | E | ⬜ |
| F-6 | Auth forms use `PasswordInput`, `Alert`, `FormField` primitives | E | ⬜ |
| F-7 | Keyboard focus visible; `aria-live` on banners; password toggle announced | M/E | ⬜ |

## 7. Data & Migration

| # | Criterion | Type | Status |
|---|---|---|---|
| D-1 | Migrations are additive-first; `SUPER_ADMIN` added before `CONCIERGE` removal | I | ⬜ |
| D-2 | CONCIERGE→STAFF data migration runs before enum change; no orphaned rows | I | ⬜ |
| D-3 | Seed idempotent; admin defaults `admin@thekingshotel.com` / `Admin123!` with bcrypt cost 10 | I | ✅ |
| D-4 | Soft-deleted users retain rows; bookings/reviews history intact | I | ✅ |
| D-5 | Auth test fixtures (CUSTOMER/STAFF/MANAGER/ADMIN) available for tests | — | ⬜ |

## 8. Performance & Reliability

| # | Criterion | Type | Status |
|---|---|---|---|
| G-1 | Edge middleware does not import Prisma/bcrypt (bundle stays Edge-safe) | S | ✅ |
| G-2 | No silent session drops mid-booking (session reliability) | M | ✅/⬜ |
| G-3 | Auth endpoints p95 < 300 ms with DB under normal load | M | ⬜ |

## 9. Release Gates (Phase-4 Done)

- [ ] All ⬜ criteria above closed or explicitly deferred with a Decision Record.
- [ ] `npm run build` green; `npx tsc --noEmit` clean; `npm test` passes; coverage ≥ 80% lines.
- [ ] Playwright suite green (register→login→profile, role gating, reset, verify, admin CRUD).
- [ ] Security regression checklist (Doc 07 §10) signed off.
- [ ] Doc statuses updated ✅/⬜ to reflect reality; Decision Records logged for every deviation.

---

*End of Document 13. Phase 4 specification suite complete (Documents 01–13).*