# Team access, role-based menu, and finishing phases 1-3

## What you get

1. **Team page (Admin only)** — see everyone in your company, invite people by email, change their role, tick which sections a Manager can open, and deactivate someone who leaves.
2. **Email invites** — you enter a name, email and role; the person gets an email link, sets their own password and lands inside your company with the role you chose.
3. **Menu matched to the person** — the sidebar only lists sections that person is allowed to open, and the bottom shows their real name, email and company instead of the placeholder. Typing a blocked address shows the "no access" screen.
4. **Sign-in required** — every page sits behind sign-in; signed-out visitors go to the sign-in page.
5. **Phase 2 finished** — the invoice form opens from the Invoices page (New invoice / Edit), and the expense form opens from the Expenses page, both saving into the visible list.
6. **Phase 3 finished** — a new **Banking** section: bank accounts with balances, imported/entered transactions, and matching a transaction to an invoice or expense so it's marked reconciled.

## Roles (unchanged)

| Role | Access |
| --- | --- |
| Admin | Everything, including Team and company settings |
| Manager | Only the sections an Admin ticks |
| Accountant | Dashboard, Invoices, Expenses, Payments, Reports |

## Technical notes

**Invites**
- New table `invitations` (organization_id, email, full_name, role, modules text[], token, status, expires_at, invited_by) with RLS: only admins of the org can read/create/revoke; grants for authenticated + service_role.
- Edge function `invite-member`: validates the caller's JWT, checks the caller is an admin of the org via the `private` helpers, creates the auth user with `inviteUserByEmail` (service role) carrying `organization_id`, `full_name`, `role`, `modules` in user metadata, and writes the invitation row. Input validated with Zod; CORS on every response.
- `handle_new_user()` updated: when the new auth user's metadata carries an `organization_id`, join that org with the given role and module rows instead of creating a new company. Without it, keep today's behaviour (new company, admin).
- Edge function `manage-member` (admin-only) for role change, module toggles and deactivate — or plain table updates where existing admin RLS policies already allow it; module ticks and role changes use direct updates, deactivate flips `profiles.is_active`.

**Frontend**
- `src/pages/Team.tsx` — member table (name, email, role badge, status), invite dialog, role select, module checkbox grid shown for Managers, deactivate/reactivate, revoke pending invite.
- `src/components/Layout/Sidebar.tsx` — build nav from `usePermissions().allowedModules`, append Settings, add Team and Banking for admins, show real user identity from `useAuth`, add sign-out.
- `src/App.tsx` — wrap in `AuthProvider`, add `/auth` and `/team` routes, wrap every app route in `ProtectedRoute` with its module key (`/team` uses `adminOnly`), drop the outer `AppLayout` since `ProtectedRoute` supplies it.
- Sign-in blocks the app while `loading`, so inactive profiles are signed out on load.

**Phases 2-3 completion**
- `src/pages/Invoices.tsx` and `src/pages/Expenses.tsx`: dialog-hosted `InvoiceForm` / `ExpenseForm` wired to local list state, currency rendered through `useCurrency`.
- `src/pages/Banking.tsx` + route `/banking` and module key `banking` added to `MODULES` and `ACCOUNTANT_MODULES`: accounts summary, transaction table with filters, "Match" action linking a transaction to an invoice/expense and marking it reconciled. Sample data in the same style as the other modules.
- New nav labels added to the en/es/fr translation files.

## Not included

- Real bank feed connections (transactions are entered or sample data).
- Multiple companies per person.
- Paddle payments (still available to switch on separately).
