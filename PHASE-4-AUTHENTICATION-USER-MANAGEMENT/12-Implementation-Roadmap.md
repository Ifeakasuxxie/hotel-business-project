# Document 12 — Implementation Roadmap

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, Project management |
| **Source of truth** | Gaps + decision records consolidated from Documents 01–11 |
| **Depends on** | All documents 01–11 |

**Status legend:** ✅ Done · 🟡 In progress · ⬜ Planned

---

## 0. Sequencing Principles

- **Tests first** (M1) so every later milestone is TDD-able.
- **DB additive-first** (M3) so nothing breaks mid-migration.
- **Authz core before admin UI** (M2 before M6) — never render admin surfaces gated only by UI.
- **Security wiring early** (M4) — rate limits + headers before opening public flows (M5).
- Each milestone ends with `npm run build` + lint + typecheck green (current gate).

---

## 1. Milestone Plan

### M1 — Test tooling bootstrap ⬜
- Add `vitest` + `@testing-library/react` + `@playwright/test` (devDeps) and `test`/`test:coverage`/`test:e2e` scripts.
- Seed fixtures: CUSTOMER, STAFF (incl. CONCIERGE specialization), MANAGER, ADMIN users.
- **Exit:** `npm test` runs; first 10 unit tests (validations + errors + rate-limit) pass.

### M2 — RBAC enforcement core ⬜
- `permission-service.ts`: `hasPermission`, `hasAnyPermission`, `requirePermission` (DB-resolved role; `["*"]` wildcard; flat match — D-RBAC-1/2/3).
- Wire `requirePermission` into user/profile services (mutations re-check authz).
- Ownership rules: booking-owned review creation, own-booking reads (Doc 05 §6).
- Middleware role gating for `/admin/*` (role claim).
- **Exit:** unit + integration tests for the permission matrix green.

### M3 — Role model migration (D-1 + D-2) ⬜
1. Add `SUPER_ADMIN` to `UserRole` enum (additive migration).
2. Seed: `SUPER_ADMIN` = `["*"]`; narrow `ADMIN` → `users:manage, hotel:configure, content:manage, pricing:manage`.
3. **Step 1 (data):** migrate `CONCIERGE` users → `STAFF` + set `StaffDepartment = CONCIERGE`.
4. **Step 2 (enum):** remove `CONCIERGE` from `UserRole`.
5. Code sweep: `ROLES` map, `staffRoles`/`adminRoles`, `requireAdmin` (narrows to SUPER_ADMIN|ADMIN), `requireSelfOrAdmin`, `createUserSchema` role enum, seed, navbar `isStaff`, profile `roleLabel`.
6. Add shared `isStaffRole`/`roleLabel` helpers (D-FE-2); migrate inline checks.
7. **Exit:** full regression of every admin-only surface against new permission sets (Doc 05 §7 checklist).

### M4 — Security hardening ⬜
- Security headers in `next.config.mjs` (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS — Doc 07 §5).
- Wire `createRateLimiter` to login/register (Doc 07 §4).
- `POST /api/profile/change-password` route + `PasswordInput` + form on profile page (service exists — Doc 06 §4).
- `x-request-id` correlation plumbing (already set by middleware).
- **Exit:** security header tests (e2e assert) + rate-limit tests green.

### M5 — Email verification + password reset ⬜
- `VerificationToken` flows (Doc 04 §3.1/3.2, D-DB-1): verify-email, resend (rate-limited), forgot (enumeration-safe 200), reset (single-use).
- Pages: `/verify-email`, `/forgot-password`, `/reset-password`; email templates via Resend (env placeholder exists).
- Login gate: `authorize` + `authService.login` reject unverified emails; admin-created accounts auto-verified (D-PROF-3).
- **Exit:** full reset + verify E2E; login-block for unverified user.

### M6 — Admin user management UI ⬜
- `/admin/users` page (route group `admin`): list (paginated), create, view, edit, deactivate.
- Components: `DataTable`, `Pagination`, `EmptyState`, `RoleBadge`, `Can`, `FormField` (Doc 10 §5).
- `apiFetch<T>` typed client wrapper (Doc 09 §5); 401 → `RequireAuthGate`.
- **Exit:** E2E admin CRUD + permission-correct row/button rendering.

### M7 — Staff dashboard + bookings ⬜
- `(staff)/dashboard` route group; role-aware landing (staff vs manager vs admin widgets).
- Fix `GET /api/bookings` `listForUser("")` gap → wire to session user.
- `/bookings` page: my bookings (customer), all bookings w/ ownership (staff).
- **Exit:** E2E dashboard gating + bookings list.

### M8 — Audit logging + session hardening ⬜
- `AuditLog` writes for `auth.*` events (Doc 04 §3.7) with `x-request-id`, ip, userAgent.
- Session revocation: `tokenVersion` claim on JWT + `logout-all` (Doc 04 §3.5).
- **Exit:** audit rows asserted in integration tests.

### M9 — MFA (TOTP) ⬜
- `User.totpSecret?`/`totpEnabled` (schema), setup/verify/disable endpoints, step-up on login.
- Optional enforcement for ADMIN/MANAGER.
- **Exit:** TOTP E2E (enroll → login step-up → disable).

### M10 — QA & release ⬜
- Full unit/integration/e2e pass; coverage thresholds (Doc 11 §5).
- Security regression checklist (Doc 07 §10); npm audit.
- CI wiring (lint, tsc, tests, build, e2e).
- Manual QA checklist (Doc 11 §6).

---

## 2. Dependency Graph

```
M1 ───────────────► everything (test harness)
M2 (RBAC core) ────► M6 (admin UI), M7 (dashboard), M3 (guards)
M3 (roles) ────────► M6, M7 (role-aware UI), M9 (step-up roles)
M4 (hardening) ────► M5 (public flows need rate limits)
M5 (email/reset) ──► M8 (audit those events)
M8 ────────────────► M9 (tokenVersion + MFA interplay)
M1..M9 ────────────► M10 (release gate)
```

**Critical path:** M1 → M2 → M3 → M6 → M10 (and M4 → M5 in parallel).

---

## 3. Effort Estimate (indicative)

| Milestone | Effort (dev-days) | Risk |
|---|---|---|
| M1 test tooling | 1–2 | Low |
| M2 RBAC core | 3–4 | Medium (permission semantics) |
| M3 role migration | 3–4 | **High** (breaking role change; data migration) |
| M4 hardening | 2–3 | Low–Med |
| M5 email/reset | 4–5 | Medium (tokens, templates, timing) |
| M6 admin UI | 4–5 | Medium |
| M7 dashboard/bookings | 3–4 | Medium |
| M8 audit + revocation | 3–4 | Medium |
| M9 MFA | 3–4 | Medium |
| M10 QA/release | 3–4 | Low |
| **Total** | **~29–39** | — |

---

## 4. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| M3 breaks an admin surface silently | High | M3 §7 regression gate; run before any staff-facing UI |
| Email flows in dev (no SMTP) | Med | Mailpit/MailHog dev sink; Resend only in prod |
| JWT revocation never fully parity with DB sessions | Med | `tokenVersion` claim scoped to auth-critical actions only |
| In-memory rate limit lost on restart/scale | Med | Documented move to Redis at Phase 9 (D-SEC-1) |
| Scope creep (MFA/audit in same phase) | Med | M8/M9 are explicit cut-lines; can slip to Phase 5 without breaking core |

---

## 5. Definition of Done (per milestone)

- `npm run build` green (lint + type + 20 pages).
- New code covered by tests (Doc 11 §3).
- No new TODO/fake/501 in touched surfaces (existing `/api/contact` 501 unchanged — out of scope).
- Docs updated where behavior changed (Decision Records).

---

*End of Document 12. Next: `13-Acceptance-Criteria.md`.*