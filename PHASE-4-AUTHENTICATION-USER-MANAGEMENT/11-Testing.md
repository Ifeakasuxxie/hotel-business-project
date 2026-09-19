# Document 11 — Testing Strategy

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering / QA |
| **Audience** | Engineering, QA |
| **Source of truth** | `package.json` (scripts), `src/lib/validations/*`, `src/lib/services/*`, `src/lib/auth/*`, `src/app/api/auth/*`, `src/middleware.ts` |
| **Depends on** | All documents 01–10 |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Current State (✅)

- **No test framework configured.** `package.json` has no `test` script; no `*.test.ts` files exist.
- Current verification gates: `npm run build` (Next 15.5.22 — runs ESLint + type-checking; 20 pages build clean), plus manual QA.
- No CI pipeline configured (🚧).
- `@playwright/test@1.51.1` appears in `package-lock.json` (transitive/optional) but is **not** a declared devDependency — the e2e tooling is effectively unset up.

---

## 2. Proposed Tooling (🚧)

| Layer | Tool | Why |
|---|---|---|
| Unit + integration | **Vitest** | Fast, TS-native, zero-config with `tsx`/SWC; no Jest babel dance |
| Component | **React Testing Library** | With `@testing-library/react` + `user-event` |
| E2E | **Playwright** | Industry standard; browsers preinstalled |
| Coverage | `@vitest/coverage-v8` | Thresholds enforced in CI |
| DB for integration | PostgreSQL test schema + `prisma migrate` fixtures | Isolated per-run |

**Recommended scripts:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

---

## 3. Test Pyramid (Phase-4 focus)

```
        ▲  5 E2E flows (auth critical paths)
      ▲▲   10–15 API integration tests
    ▲▲▲▲▲  30–40 unit tests (validation, services, roles, errors)
```

### 3.1 Unit tests (fastest, no DB)

| Target | Cases |
|---|---|
| `src/lib/validations/user.ts` | `passwordSchema` accept/reject matrix (length, case, digit, edge 8/128); `registerUserSchema` confirm-match refine + email lowercasing; `loginSchema`; `createUserSchema` role enum (incl. current CONCIERGE); `updateProfileSchema` nullable phone/image; `changePasswordSchema` |
| `src/lib/auth/roles.ts` | `isStaff/isAdmin/isCustomer/isStaffOrAdmin` truth tables; `requireRole/requireAdmin/requireStaff/requireCustomer` auth+role matrix (401 vs 403) |
| `src/lib/auth/session.ts` | `toSessionUser` mapping (id/email/name/role), `requireSelfOrAdmin` (self / ADMIN / MANAGER / other-user → 401) |
| `src/lib/middleware/rate-limit.ts` | fixed-window counting, expiry reset, `limit` boundary |
| `src/lib/errors/*` | status codes + codes for every error class (400/401/403/404/409/500/501) |
| `src/lib/utils/api-response.ts` | envelope shape with/without message, 201, 204 |
| `src/lib/services/auth-service.ts` | mock repositories: register (duplicate → 409, missing default role → 404, hash called with cost 10, DTO excludes passwordHash); login (unknown/inactive/bad password → generic 401); changePassword (wrong current → 401, rehash+update) |
| `src/lib/services/user-service.ts` | create (conflict/role-not-found), list pagination math, update name derivation + `undefined`-preserving fields, deactivate soft delete |

### 3.2 Integration tests (API routes, test DB)

Boot route handlers directly (call `POST`/`GET` exports) with a test DB + seeded roles. Cases:

| Route | Cases |
|---|---|
| `POST /api/auth/register` | 201 + envelope + no passwordHash; 409 duplicate (case-insensitive email); 400 validation; 400 non-JSON body |
| `POST /api/auth/login` | 200 + `Set-Cookie`; 401 unknown/inactive/wrong password (identical message); 400 validation |
| `POST /api/auth/logout` | 204 + cookie cleared |
| `GET /api/auth/me` | 200 with role from DB; 401 no session; 401 after deactivation |
| `GET/PUT /api/profile` | 200 self; PUT persists phone null; 401 unauthenticated; immutable email rejected |
| `GET/POST /api/users` | 200 admin list pagination; 403 non-admin; POST create with role; 409 duplicate |
| `GET/PATCH/DELETE /api/users/:id` | self-vs-other matrix (401 own-only), admin override, soft deactivate then login-blocked |
| Middleware behavior | `/api/*` protected → 401 JSON; `/profile` page unauthed → 302 `/login?next=/profile`; public `/api/rooms` passes |

### 3.3 E2E tests (Playwright)

| Flow | Assertions |
|---|---|
| Register → sign in → profile | account created banner; login; profile shows name/email; edit name → persisted; sign out → back to home |
| Protected page redirect | unauthed `/profile` → `/login?next=/profile`; after login → back to `/profile` |
| Role gating | admin user sees `/dashboard` link; customer does not; direct `/api/users` as customer → 403 |
| Bad password | generic error, no crash |
| Deactivated account | cannot log in |
| `?registered=1` banner | shown after registration |

---

## 4. Security Regression Tests (from `07-Security.md`)

- Login error text identical for unknown-user / inactive / wrong-password.
- Register 409 exposes only "email already exists" (documented exception).
- No `passwordHash` anywhere in any API response (assert on register/login/me/profile/users).
- Unauthenticated API returns the exact 401 envelope `{ success:false, error:"Authentication required", code:"UNAUTHORIZED" }`.
- `x-request-id` present on middleware-matched responses.
- After D-1: **ADMIN no longer has `["*"]`** — every admin-only surface re-verified (regression gate).

---

## 5. CI (🚧)

```yaml
steps:
  - npm ci
  - npm run db:generate
  - npm run lint            # eslint via next lint
  - npx tsc --noEmit        # explicit typecheck
  - npm test                # vitest unit+integration
  - npm run test:coverage   # thresholds: lines 80, functions 80
  - npm run build           # production build
  - npm run test:e2e        # against built app + seeded DB
  - npm audit --production
```

**Secrets:** CI DB uses ephemeral test schema; `NEXTAUTH_SECRET` generated per-run; never read real `.env`.

---

## 6. Manual QA Checklist (pre-launch)

- [ ] Register with all valid/invalid password combos → correct 400 field errors.
- [ ] Register duplicate email → 409, friendly message.
- [ ] Login success → cookie set; refresh keeps session; profile loads.
- [ ] Login with deactivated account → 401.
- [ ] Direct nav to `/profile`, `/dashboard`, `/admin/*`, `/bookings` while signed out → redirected with `next`.
- [ ] Sign out clears cookie; back-button does not restore session.
- [ ] Admin creates a user → new user logs in with the issued password.
- [ ] Admin deactivates a user → immediate 401 on `/api/auth/me` for that user.
- [ ] Session survives a cold page reload (JWT cookie).
- [ ] Mobile menu shows correct authed/guest buttons (Navbar).
- [ ] No console errors in login/register/profile flows.

---

*End of Document 11. Next: `12-Implementation-Roadmap.md`.*