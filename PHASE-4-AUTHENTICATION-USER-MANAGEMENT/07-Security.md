# Document 07 — Security

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering / Security review |
| **Audience** | Engineering, Security, QA |
| **Source of truth** | `src/lib/errors/*` (envelope + status codes), `src/lib/middleware/with-error-handler.ts`, `src/lib/middleware/with-validation.ts`, `src/lib/middleware/rate-limit.ts`, `src/middleware.ts`, `src/lib/auth/*` (04-Authentication.md), `next.config.mjs`, `.env.example`, `package.json` |
| **Depends on** | `04-Authentication.md`, `05-Authorization-RBAC.md`, `03-Database-Design.md` |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Security Posture

Defense in depth across five layers:

```
Browser → Edge middleware → App Router (validation/error) → Service (authz/ownership) → Data (Prisma/DB)
```

Each layer is independent: middleware failure doesn't expose data, and service-layer authorization never trusts middleware or JWT claims.

---

## 2. Error Envelope & Information Disclosure (✅)

`withErrorHandler` (`src/lib/middleware/with-error-handler.ts`) wraps every API route:

```json
{ "success": false, "error": "<message>", "code": "UNAUTHORIZED" }
```

- Non-`ApiError` (unexpected) → **500 `INTERNAL_ERROR`** with message `error.message`; **no stack traces** are ever returned.
- `ApiError.statusCode`/`code` surface verbatim.

### Error taxonomy (source of truth — `src/lib/errors/`)

| Error class | HTTP | `code` | Default message |
|---|---|---|---|
| `UnauthorizedError` | 401 | `UNAUTHORIZED` | Authentication required |
| `ForbiddenError` | 403 | `FORBIDDEN` | Insufficient permissions |
| `ValidationError` | **400** | `VALIDATION_ERROR` | Validation failed (+ `details` from zod `flatten()`) |
| `NotFoundError` | 404 | `NOT_FOUND` | Resource not found |
| `ConflictError` | 409 | `CONFLICT` | Resource already exists |
| `NotImplementedError` | 501 | `NOT_IMPLEMENTED` | This endpoint is not implemented yet |
| `DatabaseError` | 500 | `DATABASE_ERROR` | Database operation failed |

> **Correction note:** `ValidationError` is **400** (not 422) — verified in `validation-error.ts`. This supersedes the error table drafted in `04-Authentication.md` §6; Doc 04 is updated accordingly.

**Rules:**
- Never echo user input into error messages (unless it's the zod issue path).
- Login errors are deliberately generic: `"Invalid email or password"` for both unknown user and wrong password (`authService.login`).
- **Known exception:** `POST /api/auth/register` returns 409 on an existing email — product decision (D-AUTH-2 context). If enumeration becomes a concern, switch to a generic 200 with a "verification sent" style message.

---

## 3. Authentication Security (✅ / 🚧)

See `04-Authentication.md` for flows. Security-relevant properties:

| Control | Status | Detail |
|---|---|---|
| Hashing | ✅ | bcryptjs, cost 10, both registration & password change |
| Session cookie | ✅ | Auth.js `next-auth.session-token`: HttpOnly, Secure (prod), SameSite=Lax |
| JWT signing | ✅ | HS256 via `NEXTAUTH_SECRET`; secret required (empty in `.env.example`) |
| Generic login errors | ✅ | No user enumeration on login |
| Inactive-account rejection | ✅ | `authorize` + `authService.login` + `getCurrentUser` all reject `isActive=false` |
| Email lowercasing | ✅ | `.toLowerCase()` on register/login/create schemas |
| Email verification gate | 🚧 | Planned before login enforcement (§3.1 of Doc 04) |
| MFA | 🚧 | Planned (TOTP) — §3.6 of Doc 04 |
| Password reset | 🚧 | Planned; must be timing-safe & enumeration-safe |
| Session revocation | 🚧 | JWT strategy → expiry only; logout clears cookie |

### Secrets (`NEXTAUTH_SECRET`)
- Must be a high-entropy random string (≥32 bytes); generate with `openssl rand -base64 32`.
- Rotation plan (🚧): issue new secret, keep previous in `NEXTAUTH_SECRET_PREVIOUS` array for rolling re-sign; invalidate on compromise.
- `.env` is git-ignored; `.env.example` ships placeholders only. **Never log the secret or password hashes.**

---

## 4. Rate Limiting (🚧 wiring / ✅ primitives)

- `createRateLimiter({ limit, windowMs })` exists (`src/lib/middleware/rate-limit.ts`) — in-memory fixed-window, keyed by caller-supplied key.
- **Current status:** the primitive is exported from `src/lib/middleware/index.ts` but **not yet applied to any route** (grep confirms zero call sites).

**Planned application:**
- `POST /api/auth/login` — e.g. 10 attempts / 15 min per IP+email.
- `POST /api/auth/register` — e.g. 5 / 15 min per IP.
- `POST /api/auth/forgot` — e.g. 3 / 30 min per email.
- `POST /api/auth/reset` — e.g. 5 / 15 min per IP.

**Limitations:** in-memory store is per-instance and lost on restart. Multi-instance deployments (Phase 9) must move to a shared store (Redis). Rate-limit by **key combining IP + account** to avoid lockouts of shared corporate NATs.

---

## 5. Request & Response Hygiene

| Control | Status | Detail |
|---|---|---|
| `x-request-id` | ✅ | Set by `src/middleware.ts` on every matched request; can be correlated to `AuditLog` |
| Body parsing safety | ✅ | `withValidation` rejects non-JSON bodies with `ValidationError` |
| Zod strict parsing | ✅ | All mutation routes validate before touching the DB |
| Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | 🚧 | `next.config.mjs` has **no `headers()`** today |
| CORS | 🚧 | Same-origin only today (no cross-origin config needed until mobile/third-party clients) |
| Image allowlist | ✅ | `next.config.mjs` restricts `next/image` to `images.unsplash.com` |

**Planned headers (`next.config.mjs`):**
```js
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ],
  }];
}
```
CSP is deferred to Phase 9 (next-js-heavy app; needs inline-script allowances, nonce support).

---

## 6. CSRF, XSS, Injection

| Attack | Control | Status |
|---|---|---|
| CSRF | Auth.js built-in CSRF on `[...nextauth]`; SameSite=Lax cookie; state-changing API routes require session | ✅ / partially 🚧 |
| XSS | React 19 escapes by default; no `dangerouslySetInnerHTML` in auth surfaces; `HttpOnly` session cookie | ✅ |
| SQL injection | Prisma parameterized queries only; no raw SQL in codebase | ✅ |
| Email header injection | Zod email validation + `.toLowerCase()`; templated Resend sends (future) | ✅ / 🚧 |
| DoS / brute force | Rate limiting (primitive exists, wiring 🚧) | 🚧 |
| Mass assignment | Zod schemas whitelist fields explicitly (`updateUserSchema` has no `role`/`email`) | ✅ |

---

## 7. Data Protection & PII

PII held: email, full name, phone. No payment card data stored on our servers (payments via Stripe/Paystack — `.env.example` only holds secret keys for API-side actions).

| Requirement | Status |
|---|---|
| Minimal collection | ✅ — only required fields at registration |
| No password hash exposure | ✅ — DTOs exclude `passwordHash`; never logged |
| Audit trail for auth events | 🚧 — `AuditLog` model exists (Doc 03); event writes planned |
| Right-to-be-forgotten / GDPR erasure | 🚧 — soft deactivate only; hard-erase path must cascade bookings/reviews |
| Data minimization in logs | 🚧 — ensure no full PII in server logs |
| HTTPS only | ✅/🚧 — Secure cookie in prod; HSTS header planned |

---

## 8. Dependency & Supply Chain

Verified in `package.json`:

| Dependency | Version | Notes |
|---|---|---|
| `next` / `next-auth` | 15.5.22 / ^5.0.0-beta.32 | Beta NextAuth — pin exact versions in CI |
| `bcryptjs` | ^3.0.3 | Pure-JS; cost 10 |
| `zod` | ^3.23.8 | Single validation source |
| `@prisma/client` / `prisma` | ^5.19.0 | Parameterized queries |
| `react` | ^19.2.8 | Escaping by default |

**Planned:**
- `npm audit` + `pnpm audit` in CI.
- Lockfile committed (`package-lock.json`).
- Dependabot/renovate for patched releases.

---

## 9. Security Decision Record

### D-SEC-1 — In-memory rate limiting for Phase 4
- **Options:** (a) in-memory Map (current primitive); (b) Redis from day one.
- **Decision:** (a) for Phase 4 — single-instance, acceptable protection for auth endpoints; hard requirement to move to shared store before multi-instance (Phase 9).

### D-SEC-2 — Generic login errors
- **Options:** (a) generic 401 for all failures (current); (b) differentiated messages.
- **Decision:** (a). Prevents user enumeration; operator UX handled by account-recovery flows, not error text.

### D-SEC-3 — Register 409 on existing email
- **Options:** (a) 409 (current); (b) generic 200 + email instructions.
- **Decision:** (a) retained by product choice for now; revisit if abuse or enumeration is observed (low sensitivity — user list is not secret).

### D-SEC-4 — HS256 JWT
- **Options:** (a) HS256 (current); (b) RS256 (asymmetric, JWKS).
- **Decision:** (a) for Phase 4 — single signing service; revisit for multi-service/mobile when a public verification key is needed.

### D-SEC-5 — bcrypt cost 10
- **Options:** (a) cost 10 (current); (b) higher (12+).
- **Decision:** (a) — balances latency on the serverless/Node runtime with brute-force resistance; revisit with load testing. Centralized in `authService` + `credentials` so a change is a two-line diff.

---

## 10. Security Review Checklist (pre-launch, 🚧)

- [ ] Security headers wired (`next.config.mjs`).
- [ ] Rate limiting applied to login/register/forgot/reset.
- [ ] Email verification enforced on login.
- [ ] Password reset implemented (single-use tokens, no enumeration, timing-safe compare).
- [ ] MFA optional for ADMIN/MANAGER.
- [ ] Audit log writes for all auth events.
- [ ] Secret rotation runbook.
- [ ] CSP nonce strategy defined (Phase 9).
- [ ] Dependabot + audit in CI.

---

*End of Document 07. Next: `08-API-Specification.md`.*