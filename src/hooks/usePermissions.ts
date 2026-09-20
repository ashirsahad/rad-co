import { useAuth, AppRole } from "@/hooks/useAuth";

export const MODULES = [
  { key: "dashboard", label: "Dashboard", href: "/", i18nKey: "navigation.dashboard" },
  { key: "invoices", label: "Invoices", href: "/invoices", i18nKey: "navigation.invoices" },
  { key: "clients", label: "Clients", href: "/clients", i18nKey: "navigation.clients" },
  { key: "expenses", label: "Expenses", href: "/expenses", i18nKey: "navigation.expenses" },
  { key: "pos", label: "POS", href: "/pos", i18nKey: "navigation.pos" },
  { key: "payments", label: "Payments", href: "/payments", i18nKey: "navigation.payments" },
  { key: "banking", label: "Banking", href: "/banking", i18nKey: "navigation.banking" },
  { key: "inventory", label: "Inventory", href: "/inventory", i18nKey: "navigation.inventory" },
  { key: "projects", label: "Projects", href: "/projects", i18nKey: "navigation.projects" },
  { key: "reports", label: "Reports", href: "/reports", i18nKey: "navigation.reports" },
] as const;

export const ACCOUNTANT_MODULES = [
  "dashboard",
  "invoices",
  "expenses",
  "payments",
  "banking",
  "reports",
];

export function canAccess(role: AppRole | null, modules: string[], moduleKey: string) {
  if (!role) return false;
  if (role === "admin") return true;
  if (role === "accountant") return ACCOUNTANT_MODULES.includes(moduleKey);
  return modules.includes(moduleKey);
}

export function usePermissions() {
  const { role, modules } = useAuth();

  return {
    role,
    isAdmin: role === "admin",
    canAccess: (moduleKey: string) => canAccess(role, modules, moduleKey),
    allowedModules: MODULES.filter((m) => canAccess(role, modules, m.key)),
  };
}
