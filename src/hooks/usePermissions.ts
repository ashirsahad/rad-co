import { useAuth, AppRole } from "@/hooks/useAuth";

export const MODULES = [
  { key: "dashboard", label: "Dashboard", href: "/" },
  { key: "invoices", label: "Invoices", href: "/invoices" },
  { key: "clients", label: "Clients", href: "/clients" },
  { key: "expenses", label: "Expenses", href: "/expenses" },
  { key: "pos", label: "POS", href: "/pos" },
  { key: "payments", label: "Payments", href: "/payments" },
  { key: "inventory", label: "Inventory", href: "/inventory" },
  { key: "projects", label: "Projects", href: "/projects" },
  { key: "reports", label: "Reports", href: "/reports" },
] as const;

export const ACCOUNTANT_MODULES = ["dashboard", "invoices", "expenses", "payments", "reports"];

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
