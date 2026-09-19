# Document 10 — UI Components (Phase 4)

| Field | Value |
|---|---|
| **Project** | The Kings Hotel — Hospitality Platform |
| **Phase** | Phase 4 — Authentication & User Management |
| **Document status** | Draft for review |
| **Owner** | Engineering / Design |
| **Audience** | Engineering, QA |
| **Source of truth** | `src/components/ui/*`, `src/components/common/navbar.tsx`, `src/app/(auth)/{login,register,profile}/page.tsx`, `src/app/globals.css`, `tailwind.config.ts` |
| **Depends on** | `09-Frontend-Architecture.md` |

**Status legend:** ✅ Implemented · 🚧 Planned

---

## 1. Design Tokens (from `globals.css`)

HSL theme variables consumed via Tailwind:

| Token | HSL | Usage |
|---|---|---|
| `background` | `40 8% 96%` | Warm off-white |
| `foreground` | `240 30% 14%` | Ink navy |
| `card` / `card-foreground` | `0 0% 100%` / ink | Surfaces |
| `primary` (gold) | `42 50% 57%` | Brand accent |
| `secondary` | `40 8% 92%` | Hover/soft fills |
| `muted` / `muted-foreground` | `0 0% 98%` / `220 9% 46%` | Quiet text |
| `destructive` | `0 70% 50%` | Errors |
| `border` / `input` / `ring` | `220 13% 91%` / `0 0% 98%` / gold | Borders/focus |
| `radius` | `0.5rem` | Base radius |

Utility classes: `.heading-serif`, `.section-tag`, `.container-page` (`.heading-serif` uses the Playfair Display variable font).

---

## 2. Existing UI Primitives (✅)

| Component | File | Props / variants |
|---|---|---|
| `Button` | `src/components/ui/button.tsx` | `variant`: default, **gold**, destructive, outline, secondary, ghost, link · `size`: default (h-11), sm (h-9), lg (h-12), icon · `asChild` (Radix `Slot` for links) |
| `Badge` | `src/components/ui/badge.tsx` | `variant`: default, **gold**, secondary, destructive, outline |
| `Card` + `CardHeader/Title/Description/Content/Footer` | `src/components/ui/card.tsx` | Composable surface container |
| `Input` | `src/components/ui/input.tsx` | h-11, gold focus ring (`ring-gold/40`) |
| `Label` | `src/components/ui/label.tsx` | Form labels |
| `Textarea` | `src/components/ui/textarea.tsx` | Multiline input |

**Radix primitives installed but unused so far:** `Dialog`, `DropdownMenu`, `Select` (all `@radix-ui/react-*` in `package.json`).

---

## 3. Auth/Account UI Patterns (current usage — ✅)

### 3.1 Auth shells
Both login/register use:
```
container-page py-* flex min-h-[85vh] items-center justify-center
  → Card (max-w-md / max-w-lg, bg-card/90 backdrop-blur-sm)
```
- Login card: `Badge variant="gold"` "Member Sign In" · serif title "Welcome Back" · description.
- Register card: "Join The Kings Hotel" · "Create Your Account" · two-column field grid on `sm+`.

### 3.2 Inline alert banners (hand-rolled today)
Success (register→login, profile save):
```
rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300
```
Error:
```
rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive
```
**Refactor target (🚧):** extract `Alert` component (§5).

### 3.3 Loading
- Buttons: `Loader2` (`lucide-react`) `animate-spin` beside label, `disabled`.
- Profile page: full-card "Loading profile…" with spinner.

### 3.4 Input adornment
Icons positioned inside inputs (login/register):
```
<div className="relative"> <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/> <Input className="pl-9"/> </div>
```

### 3.5 Role badge (profile page)
`Badge variant="gold"` + `ShieldCheck` icon; label mapping (hardcoded):
- ADMIN/MANAGER → "Administrator"
- STAFF/CONCIERGE → "Hotel Staff"
- else → "Member"
**Refactor target (🚧 D-FE-2):** shared `roleLabel(role)` helper.

### 3.6 Empty / auth-required state (profile page)
401 → inline card with "Go to Sign In" `Button` → `router.push("/login")`.

---

## 4. Component Rules

1. **UI primitives never import session/auth** — state comes from props.
2. **`Button asChild`** is used for link-styled-as-button (Navbar Dashboard/Profile/Book).
3. **All icons** from `lucide-react`, rendered as 14–20px, `text-muted-foreground` in input adornments.
4. **No new Tailwind color literals** outside the token palette.
5. Server-rendered components only render auth-dependent markup via server guard props (no `useSession` in server components).

---

## 5. Planned Components (🚧)

| Component | Purpose | Spec |
|---|---|---|
| `Alert` | Success/error/info banners | `variant`: success/error/info/warning; icon + message + optional action; `role="alert"` for errors, `aria-live="polite"` for success. Replaces hand-rolled banners. |
| `FormField` | Label + control + inline error | RHF-backed: `name`, `label`, `description?`, `error?`; error text below input (destructive), `aria-describedby` wired to error id. |
| `PasswordInput` | Password with visibility toggle | Wraps `Input`; `Eye/EyeOff` toggle button (type=text/password); keeps `autoComplete` passthrough. |
| `RoleBadge` | Role indicator | `role: AuthRole` → label + gold badge; uses shared `roleLabel` map (D-FE-2). |
| `UserMenu` | Account dropdown | Radix `DropdownMenu`: Profile, Dashboard (staff), Sign Out. Replaces the Navbar's inline button group. |
| `Can` | Permission gate (cosmetic) | `<Can permission="users:manage">…</Can>`; reads role prop (not session internally). |
| `Pagination` | List paging | `page`, `pageSize`, `totalPages` from `Paginated<T>`; prev/next + page numbers; used by admin users list. |
| `EmptyState` | Empty list state | Icon + title + description + optional CTA; used by bookings/admin lists. |
| `RequireAuthGate` | Client 401 handler | On `UNAUTHORIZED`, redirects to `/login?next=`; optional `redirectTo`. |
| `DataTable` (simple) | Admin rows | Header + rows + actions column; sortable later. Phase-4 scope: users list. |

---

## 6. Form Validation Display (login/register/profile)

| Source of truth | Server | Client |
|---|---|---|
| Schemas | `src/lib/validations/user.ts` (zod) | 🚧 same schemas via `zodResolver` (D-FE-1) |
| Current client validation | manual (confirm-match check) | — |
| Error surfacing | top-level message only | 🚧 per-field `details.fieldErrors` mapping |

**Password policy text (client):** "Password must be at least 8 characters and include uppercase, lowercase, and a number." — mirrors `passwordSchema`.

---

## 7. Acceptance (visual)

- Focus ring visible on all interactive elements (`ring-gold/40`).
- Buttons show loading state and never double-submit (disabled while pending).
- All icons have accessible names (text or `aria-label`); decorative icons are hidden from AT (lucide default `aria-hidden`).
- No content shift when toggling password visibility.
- Error banners read by screen readers on appearance.

---

*End of Document 10. Next: `11-Testing.md`.*