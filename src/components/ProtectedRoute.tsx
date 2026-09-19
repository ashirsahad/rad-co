import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  module?: string;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, module, adminOnly }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { canAccess, isAdmin } = usePermissions();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const allowed = adminOnly ? isAdmin : module ? canAccess(module) : true;

  if (!allowed) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <ShieldAlert className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">No access</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            You don't have permission to open this section. Ask an admin of your company to grant access.
          </p>
        </div>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
