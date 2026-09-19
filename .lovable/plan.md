# Team accounts, roles and per-company data separation

## What you get

- Sign-in and sign-up with email + password, plus Google.
- Every person who signs up creates their own company. They become the Admin of that company and see only their own company's data — never another company's.
- You keep full control inside your company: add team members, choose their role, switch modules on or off per person.
- Nobody can change how the app itself works or looks. Settings are limited to their own company details (name, currency, language, tax, logo).

## Roles

| Role | Access |
| --- | --- |
| Admin | Everything in their company: all modules, company settings, team members and permissions. The person who creates the company is Admin. |
| Manager | Only the modules an Admin ticks for them (Dashboard, Invoices, Clients, Expenses, POS, Payments, Inventory, Projects, Reports). No team or company settings. |
| Accountant | A fixed accounting view: Dashboard, Invoices, Expenses, Payments, Reports. No POS, team or company settings. |

## Screens

1. **Sign in / Sign up** — a public page, black-and-white to match the app. Sign-up asks for full name, company name, email, password. Google button on both.
2. **Team** (Admin only, in the sidebar) — list of everyone in the company with their role and status; invite by email, change role, tick module access for Managers, deactivate someone.
3. **Settings** — company profile only; app-wide behaviour and theme are not editable.
4. **Sidebar and routes** — each person only sees menu items they're allowed to open. Typing a blocked address in the browser shows a short "no access" page instead of the module.
5. **Signed-out visitors** are sent to the sign-in page from any app page.

## Technical notes

- Enable email/password auth and Google provider on Lovable Cloud.
- New tables (all with row-level security and grants):
  - `organizations` — company name, currency, created_by.
  - `profiles` — one row per user (full name, email, avatar), linked to auth user, with `organization_id`.
  - `app_role` enum (`admin`, `manager`, `accountant`) and a separate `user_roles` table (user_id, organization_id, role) — roles never stored on profiles.
  - `user_module_access` — user_id, organization_id, module key, enabled. Used for Manager ticks; Admin and Accountant resolve from role.
- Security-definer functions: `has_role(_user_id, _org, _role)`, `current_org_id()`, `can_access_module(_user_id, _module)`. Every RLS policy on business tables filters by `organization_id = current_org_id()` so one company can never read another's rows.
- Signup trigger on `auth.users`: creates the profile, creates the organization, and grants that user the `admin` role for it (one company, one user per signup for now).
- Frontend: `src/hooks/useAuth.tsx` (session context with `onAuthStateChange` registered before `getSession`), `src/hooks/usePermissions.ts` (role + module map), `src/components/ProtectedRoute.tsx` wrapping every app route with an optional required module; `src/pages/Auth.tsx` and `src/pages/Team.tsx`. Sidebar filters nav items through `usePermissions`, and shows the real signed-in name and email instead of the current placeholder.
- Existing pages still show their sample data; this change adds accounts, scoping and gating, not a data migration.

## Not included

- Customer-facing portal for your clients to view their own invoices (separate from team accounts).
- Multiple companies per user, or inviting an existing user into a second company.
