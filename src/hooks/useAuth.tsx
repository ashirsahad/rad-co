import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "accountant";

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  modules: string[];
  organizationName: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccess = async (userId: string) => {
    const [{ data: profileData }, { data: roleData }, { data: moduleData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("user_module_access").select("module_key, enabled").eq("user_id", userId),
    ]);

    setProfile((profileData as Profile) ?? null);
    setRole(((roleData?.role as AppRole) ?? null) as AppRole | null);
    setModules((moduleData ?? []).filter((m) => m.enabled).map((m) => m.module_key));

    if (profileData?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", profileData.organization_id)
        .maybeSingle();
      setOrganizationName(org?.name ?? null);
    } else {
      setOrganizationName(null);
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        setTimeout(() => {
          loadAccess(nextSession.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
        setModules([]);
        setOrganizationName(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadAccess(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    if (user) await loadAccess(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, role, modules, organizationName, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
