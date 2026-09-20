import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingDown,
  CreditCard,
  BarChart3,
  Settings,
  ShoppingCart,
  Package,
  Folder,
  Landmark,
  UsersRound,
  LogOut,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  invoices: FileText,
  clients: Users,
  expenses: TrendingDown,
  pos: ShoppingCart,
  payments: CreditCard,
  banking: Landmark,
  inventory: Package,
  projects: Folder,
  reports: BarChart3,
};

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation("common");
  const { allowedModules, isAdmin } = usePermissions();
  const { profile, organizationName, signOut } = useAuth();

  const navigation = [
    ...allowedModules.map((m) => ({
      name: t(m.i18nKey, { defaultValue: m.label }),
      href: m.href,
      icon: ICONS[m.key] ?? LayoutDashboard,
    })),
    ...(isAdmin
      ? [{ name: t("navigation.team", { defaultValue: "Team" }), href: "/team", icon: UsersRound }]
      : []),
    { name: t("navigation.settings"), href: "/settings", icon: Settings },
  ];

  const displayName = profile?.full_name || profile?.email || "";
  const initial = (displayName || "?").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-sidebar-primary rounded-md flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-sidebar-foreground truncate">{t("app.name")}</h1>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {organizationName ?? t("app.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Language and Currency Switchers */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <div className="flex flex-col space-y-2">
          <LanguageSwitcher />
          <CurrencySwitcher />
        </div>
      </div>

      {/* User info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || "Member"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
