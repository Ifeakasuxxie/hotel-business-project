# Document 06 — User Profile & Account Management

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, QA, Product |
| **Source of truth** | `src/app/(auth)/profile/page.tsx`, `src/app/api/profile/route.ts`, `src/app/api/users/route.ts`, `src/app/api/users/[id]/route.ts`, `src/lib/services/profile-service.ts`, `src/lib/services/user-service.ts`, `src/lib/services/auth-service.ts` (changePassword), `src/lib/validations/user.ts`, `prisma/schema.prisma` (User) |
| **Depends on** | `03-Database-Design.md`, `04-Authentication.md`, `05-Authorization-RBAC.md` |
| **Referenced by** | `08-API-Specification.md`, `10-UI-Components.md`, `11-Testing.md` |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Profile Data Model

The profile is the **`User` model** (no separate profile table). Editable and display fields:

| Field | Type | Editable by self | Admin-editable | Notes |
|---|---|---|---|---|
| `firstName` | String | ✅ | ✅ | 1–60 chars, trimmed |
| `lastName` | String | ✅ | ✅ | 1–60 chars, trimmed |
| `name` | String | via firstName+lastName | via `updateUserSchema.name` | Composite, derived by default |
| `email` | String (unique) | ❌ (immutable) | ❌ (not in `updateUserSchema`) | Verified-identity field |
| `phone` | String? | ✅ | ✅ | 7–20 chars; nullable |
| `image` | String? (URL) | ✅ (`updateProfileSchema`) | ✅ | Avatar URL |
| `emailVerified` | Boolean | — | — | Display-only; planned verification flow |
| `isActive` | Boolean | — | ✅ (`updateUserSchema`) | Deactivation = soft delete |
| `roleId` | FK → Role | ❌ | via create only (role not in `updateUserSchema`) | Role changes require new schema support |

---

## 2. DTOs (`src/lib/types`)

### `UserProfileDto` (returned by `/api/profile`, `GET /api/users/:id`)
```ts
{ id, firstName, lastName, name, email, phone, image, emailVerified, role }
```
Used by the profile page. `role` = `user.role.name` from DB (fresh, not JWT).

### `UserDto` (admin lists)
```ts
{ id, firstName, lastName, name, email, phone, roleId, isActive, role }
```
Used by `GET /api/users` (admin user management).

---

## 3. My Profile — Self-Service (✅)

### 3.1 Read — `GET /api/profile`

`profileService.getProfile()`:
1. `requireAuth()` → 401 if no session.
2. `userService.getById(session.id)` → `userRepository.findByIdWithRole` → 404 if missing → `UserProfileDto`.

### 3.2 Update — `PUT /api/profile`

`profileService.updateProfile(input)`:
1. `requireAuth()`.
2. `userService.update(session.id, input)` → `userRepository.update`.

**Request body (validated by `updateProfileSchema`):**
```json
{ "firstName": "John", "lastName": "Doe", "phone": "+2348012345678", "image": "https://…" }
```
All fields optional; `phone`/`image` accept `null`.

**`userService.update` semantics:**
- Rebuilds `name` as `firstName + " " + lastName` unless an explicit `name` is passed.
- Uses `undefined`-preserving spread so omitted fields are untouched (`input.phone === undefined ? undefined : input.phone`).
- Returns `UserProfileDto` (re-reads role after update).

### 3.3 UI — `src/app/(auth)/profile/page.tsx` (✅)

Client component (`"use client"`):
- **Personal Details form:** firstName, lastName, phone; `PUT /api/profile`; shows success/error banners; `router.refresh()` after save.
- **Email:** disabled input with note *"Your email address cannot be changed."* (immutability enforced in UI; also absent from `updateProfileSchema`).
- **Role badge:** derived label — ADMIN/MANAGER → "Administrator", STAFF/CONCIERGE → "Hotel Staff", else "Member".
- **Sign Out:** `signOut({ callbackUrl: "/" })` via `next-auth/react`.
- Loading state (`Loader2`) and 401 error state with "Go to Sign In" fallback.

**UI gaps (🚧):**
- `emailVerified` is fetched but **not displayed** (no verification banner).
- No change-password form (service method exists — §4).
- No avatar upload/preview UI.
- No link to bookings/orders.

---

## 4. Change Password (🚧 UI / partial service)

`authService.changePassword` is fully implemented (validates current password, rehashes with cost 10, updates DB). `changePasswordSchema` exists (`currentPassword` + `newPassword` with full strength policy).

**Missing (planned):**
- Route: `POST /api/profile/change-password` (or fold into `PUT /api/profile`) — see `08-API-Specification.md`.
- Form in `profile/page.tsx` with current/new/confirm fields.
- Force-logout after change (optional; default keep session).

---

## 5. Admin User Management (✅)

### 5.1 List — `GET /api/users?page=&pageSize=`

- `requireAdmin()` (role ∈ {ADMIN, MANAGER} — current semantics).
- `userService.list({})` → `paginationSchema` (defaults page=1, pageSize=20) → paginated `{ items, total, page, pageSize, totalPages }`.

### 5.2 Create — `POST /api/users`

- `requireAdmin()`.
- `createUserSchema`: firstName, lastName, email, phone?, password (strength policy), `role` ∈ {CUSTOMER, STAFF, ADMIN, MANAGER, CONCIERGE}.
- `userService.create`: email-conflict → 409; role lookup → 404 if unconfigured; hashes with cost 10; `role` defaults to `CUSTOMER`.
- **Security consideration (🚧):** admin-created accounts currently get `emailVerified: false` (same as self-registration) but there is no admin "force verify" flag. See D-PROF-3.

### 5.3 Get one — `GET /api/users/:id`

- `requireSelfOrAdmin(id)` — self **or** ADMIN/MANAGER.
- Returns `UserProfileDto`.

### 5.4 Update — `PATCH /api/users/:id`

- `requireSelfOrAdmin(id)`.
- `updateUserSchema`: firstName, lastName, `name`, phone, image, `isActive`.
- **Cannot change** email or role (not in schema) — documented limitation (D-PROF-2).

### 5.5 Deactivate — `DELETE /api/users/:id`

- `requireAdmin()`.
- `userService.deactivate` → sets `isActive = false` (**soft delete**; row retained for booking/history integrity).

### 5.6 Guards on soft-deleted users

- `authService.login` rejects `!isActive`.
- Credentials `authorize` returns `null` for `!isActive`.
- `authService.getCurrentUser` rejects inactive.
- Deactivated users cannot re-login; active sessions remain until JWT expiry (documented in `07-Security.md`).

**Admin UI (🚧):** no `/admin/users` page yet — user-management endpoints exist, the management console is planned in `09-Frontend-Architecture.md`.

---

## 6. Planned Account Features (🚧)

| Feature | Carrier | Notes |
|---|---|---|
| Email verification banner + resend | profile page + `POST /api/auth/verify-email` | §3 of `04-Authentication.md` |
| Email address change (with re-verification) | new flow | Email is immutable today (D-PROF-2) |
| Change password form | profile page + new route | Service exists |
| Avatar upload | profile page + storage | Image is a URL today |
| Notification preferences | `Notification` model read pref + toggles | See `03-Database-Design.md` |
| Booking history widget | profile page | Reads `/api/bookings?mine=true` |
| Two-factor enrollment | profile page + MFA endpoints | `04-Authentication.md` §3.6 |

---

## 7. Decision Record

### D-PROF-1 — No separate profile table
- **Options:** (a) fields on `User` (current); (b) `UserProfile` 1:1 table.
- **Decision:** (a). Fields are 1:1 and few; a split adds join cost with no benefit at this scale.

### D-PROF-2 — Email is immutable
- **Options:** (a) immutable (current); (b) editable with re-verification.
- **Decision:** (a) for Phase 4 — email is the auth identifier. Add (b) as a standalone, carefully-scoped flow later (token re-issue to new address, audit trail).

### D-PROF-3 — Admin-created accounts & emailVerified
- **Options:** (a) all accounts require verification (current, once verification ships); (b) admin-created accounts auto-verified.
- **Decision:** (b) is recommended when verification lands — an admin-issued credential is already trusted; email verification only matters for self-registration. Add `emailVerified: true` on admin create (one-line change in `userService.create`).

### D-PROF-4 — Deactivate is soft
- **Options:** (a) hard delete (destructive to booking/review FKs); (b) `isActive=false` (current).
- **Decision:** (b). Preserves referential history; consistent with audit needs.

---

*End of Document 06. Next: `07-Security.md`.*