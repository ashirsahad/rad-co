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
  Folder
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

export function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation('common');

  const navigation = [
    { name: t('navigation.dashboard'), href: "/", icon: LayoutDashboard },
    { name: t('navigation.invoices'), href: "/invoices", icon: FileText },
    { name: t('navigation.clients'), href: "/clients", icon: Users },
    { name: t('navigation.expenses'), href: "/expenses", icon: TrendingDown },
    { name: t('navigation.pos'), href: "/pos", icon: ShoppingCart },
    { name: t('navigation.payments'), href: "/payments", icon: CreditCard },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Projects", href: "/projects", icon: Folder },
    { name: t('navigation.reports'), href: "/reports", icon: BarChart3 },
    { name: t('navigation.settings'), href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-sidebar-primary rounded-md flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">{t('app.name')}</h1>
            <p className="text-xs text-sidebar-foreground/60">{t('app.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
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
            <span className="text-sm font-medium text-sidebar-accent-foreground">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}