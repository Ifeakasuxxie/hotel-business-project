# Document 09 — Frontend Architecture

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering |
| **Audience** | Engineering, QA |
| **Source of truth** | `src/app/layout.tsx`, `src/app/(auth)/{login,register,profile}/page.tsx`, `src/components/common/navbar.tsx`, `src/middleware.ts`, `src/components/ui/*`, `package.json` |
| **Depends on** | `04-Authentication.md`, `05-Authorization-RBAC.md`, `06-User-Profile.md`, `08-API-Specification.md` |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Stack & Conventions

- **Next.js 15.5 App Router**, React 19, TypeScript 5.5, Tailwind CSS 3.4.
- **No state/data library** (no react-query/SWR). Data fetching is `fetch` + local `useState` (current), or server components for reads.
- `react-hook-form` + `@hookform/resolvers` + `zod` are installed (used for the contact form) — **available but not yet applied to auth forms** (🚧 migration, D-FE-1).
- Path alias `@/*` → `src/*`.

---

## 2. Route Structure

```
src/app/
├── layout.tsx                 # Root: SessionProvider + Navbar + Footer
├── (public)/                  # Public marketing/content pages
│   ├── page.tsx               # Home
│   ├── book/                  # Booking flow (room availability + confirm)
│   ├── rooms/, about/, experience/, contact/, services/, testimonials/
├── (auth)/                    # Auth zone (unauthenticated surfaces)
│   ├── login/page.tsx         # Login form
│   ├── register/page.tsx      # Registration form
│   └── profile/page.tsx       # My Profile (protected by middleware)
└── api/                       # Route handlers (see 08-API-Specification)
```

**Planned additions (🚧):**

```
src/app/
├── (staff)/
│   └── dashboard/             # Role-aware staff/admin dashboard (protected)
├── admin/
│   └── users/                 # User management console (users:manage)
├── bookings/                  # My bookings (customer) / all bookings (staff)
└── (auth)/
    ├── forgot-password/page.tsx
    ├── reset-password/page.tsx
    └── verify-email/page.tsx
```

Route groups keep URLs flat (`/dashboard`, `/admin/users`, `/bookings`) while separating layouts/guards.

---

## 3. Session & Auth-Aware UI

### 3.1 Provider tree (`src/app/layout.tsx` ✅)

```
<SessionProvider>  ← next-auth/react, wraps everything
  <Navbar/>
  <main>{children}</main>
  <Footer/>
</SessionProvider>
```

- `SessionProvider` (default client) exposes `useSession()` to the whole tree.
- Server components/services use `auth()`/`requireAuth()` from `src/lib/auth` (Node runtime).

### 3.2 Client-side pattern — `useSession` ✅ (`navbar.tsx`)

Current usage in the Navbar:

```ts
const { status, data: session } = useSession();
const isAuthed = status === "authenticated";
const role = session?.user?.role;
const isStaff = role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "CONCIERGE";
```

- `status === "loading"` → renders nothing (avoids auth-state flicker).
- Authed → Dashboard (staff only) · Profile · Sign Out (`callbackUrl: "/"`).
- Guest → Sign In · Join Us.
- **Note:** `isStaff`/role strings are hardcoded here — **UI only**; server always re-authorizes (D-RBAC-3). After D-1/D-2 this set changes (CONCIERGE removal, SUPER_ADMIN addition) — centralize into a shared constant (D-FE-2).

### 3.3 Server-side guard pattern ✅/🚧

Server components / actions use:
- `requireAuth()` → 401 on missing session.
- `requireRole/requireStaff/requireAdmin` → 403.
- `currentUser()` → nullable, for "signed-in-aware" UI.

**Planned:** a `guard(user)` helper for pages so a protected page renders either the authed view or a `notFound()`/redirect — same code path in both server components and route handlers.

### 3.4 Role-aware `<Can>` component 🚧

```tsx
<Can permission="users:manage">  <AdminOnlyButton/>  </Can>
```
- Reads role from `useSession()` (client) or passed props.
- **Cosmetic only** — enforcement is server-side (§05 §3.5). If role set grows, keep `Can` dumb and let the server variant decide.

---

## 4. Page Specifications

### 4.1 Login (`src/app/(auth)/login/page.tsx` ✅)

- Client component; `Suspense` wrapper because it reads `useSearchParams`.
- Uses `signIn("credentials", { redirect: false })` → on error shows "Invalid email or password" → on success `router.push(next ?? "/")` + `router.refresh()`.
- `?next=` restored after redirect (set by middleware).
- `?registered=1` shows "Account created. Please sign in to continue."
- Fields: email (`autoComplete="email"`), password (`current-password`); gold submit button with `Loader2` spinner; link to `/register`.

**Gap (🚧):** no "Forgot password?" link yet.

### 4.2 Register (`src/app/(auth)/register/page.tsx` ✅)

- Client component; posts `{ firstName, lastName, email, phone, password, confirmPassword }` to `/api/auth/register`.
- Client-side pre-check: password === confirmPassword.
- Password field `minLength={8}` + helper text (mirrors `passwordSchema`).
- On success → `router.push("/login?registered=1")`.

**Gap (🚧):** server-side 400 `details.fieldErrors` are not surfaced per-field (only the top-level message). Planned with RHF migration (D-FE-1).

### 4.3 Profile (`src/app/(auth)/profile/page.tsx` ✅)

Covered fully in `06-User-Profile.md` §3.3. Client component, `GET`/`PUT /api/profile`, role badge, immutable email, Sign Out.

### 4.4 Planned pages 🚧

| Page | Route | Access | Data source |
|---|---|---|---|
| Staff dashboard | `/dashboard` | `requireStaff()` | services/`auth()` |
| User management | `/admin/users` | `users:manage` | `GET /api/users` |
| My bookings | `/bookings` | `requireAuth()` | `GET /api/bookings` (fix `listForUser("")` gap first) |
| Forgot password | `/forgot-password` | public | `POST /api/auth/forgot` |
| Reset password | `/reset-password` | public + token | `POST /api/auth/reset` |
| Verify email | `/verify-email` | public + token | `POST /api/auth/verify-email` |

---

## 5. Data Fetching Rules

| Concern | Rule |
|---|---|
| Server components | Call services directly (`authService`, `userService`) — no HTTP round-trip |
| Client components | `fetch("/api/...")` with the JSON envelope; treat `success:false` as error |
| Revalidation | `router.refresh()` after mutations (profile page does this) |
| Cache | `dynamic = "force-dynamic"` on auth/profile/user routes |
| 401 handling | Client checks `code === "UNAUTHORIZED"` → redirect to `/login?next=` |
| Shared fetcher | 🚧 a typed `apiFetch<T>()` wrapper (parse envelope, throw on `success:false`) |

---

## 6. Component Inventory (existing — `src/components/ui/*`)

`Button` (variants incl. `gold`, `ghost`, `outline`, destructive-ready), `Card/CardHeader/CardTitle/CardDescription/CardContent`, `Input`, `Label`, `Textarea`, `Badge` (variants incl. `gold`), plus Radix-based `Dialog`, `DropdownMenu`, `Select` (deps present but dropdown/select/dialog not yet used).

**Planned additions (🚧):** `FormField` (label+input+inline error, RHF-backed), `PasswordInput` (show/hide toggle), `Alert` (success/error banners — currently hand-rolled), `UserMenu` (dropdown: profile/settings/sign-out), `RoleBadge`, `Pagination`, `EmptyState`.

---

## 7. Error, Loading & Empty States

| State | Pattern (current) | Improvement (🚧) |
|---|---|---|
| Loading | `Loader2` spinner + text (login/register/profile) | skeleton components |
| Error (auth) | inline banner, `text-destructive`, border `destructive/30` | centralized `Alert` |
| 401 on page | login page has "Go to Sign In" card; middleware redirect covers most | shared `RequireAuthGate` |
| Empty lists | n/a (no list pages yet) | `EmptyState` with CTA |

---

## 8. Accessibility & UX Checklist (auth surfaces)

- ✅ Labels bound via `htmlFor`; icons are decorative (`aria-hidden` via lucide default).
- ✅ `autoComplete` correct on all auth inputs.
- ✅ Focus states via Tailwind defaults + `focus-visible` ring on `Button`.
- ✅ Password helper text explains policy.
- 🚧 Per-field error messages (RHF migration).
- 🚧 `aria-live="polite"` on success/error banners.
- 🚧 Show/hide password toggle.

---

## 9. Decision Record

### D-FE-1 — Migrate auth forms to react-hook-form + zod resolver
- **Options:** (a) current `useState` + manual validation (client only re-checks confirm match); (b) RHF + `zodResolver` (deps already installed).
- **Decision:** (b) when auth forms are touched again — gives per-field errors from the same `zod` schemas as the API (single source of truth). Non-blocking.

### D-FE-2 — Single source for role categorization
- **Options:** (a) inline role checks in components (current); (b) shared `isStaffRole/roleLabel` helpers (mirror `src/lib/auth/roles.ts`).
- **Decision:** (b) — required to land alongside D-1/D-2; otherwise the navbar and profile badge (which hardcode role→label maps) will drift when roles change.

### D-FE-3 — Client auth UI is never an authorization boundary
- Reinforces D-RBAC-3: `useSession`/`Can` may hide UI but must never be the only check.

---

*End of Document 09. Next: `10-UI-Components.md`.*