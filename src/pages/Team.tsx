import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { MODULES, ACCOUNTANT_MODULES } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Plus, UserCheck, UserX } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role: AppRole | null;
  modules: string[];
}

interface Invitation {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  status: string;
  created_at: string;
}

const ROLE_OPTIONS: { value: AppRole; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Full access, including team and company settings" },
  { value: "manager", label: "Manager", hint: "Only the sections you tick below" },
  { value: "accountant", label: "Accountant", hint: "Dashboard, Invoices, Expenses, Payments, Banking, Reports" },
];

export default function Team() {
  const { user, profile, refresh } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("manager");
  const [inviteModules, setInviteModules] = useState<string[]>(["dashboard"]);

  const orgId = profile?.organization_id;

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: access }, { data: invitations }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, is_active").order("created_at"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("user_module_access").select("user_id, module_key, enabled"),
      supabase.from("invitations").select("id, email, full_name, role, status, created_at").order("created_at", { ascending: false }),
    ]);

    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role as AppRole]));
    setMembers(
      (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        is_active: p.is_active,
        role: roleMap.get(p.id) ?? null,
        modules: (access ?? [])
          .filter((a) => a.user_id === p.id && a.enabled)
          .map((a) => a.module_key),
      })),
    );
    setInvites(((invitations ?? []) as Invitation[]).filter((i) => i.status === "pending"));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleInviteModule = (key: string) => {
    setInviteModules((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const sendInvite = async () => {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("invite-member", {
      body: {
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole,
        modules: inviteRole === "manager" ? inviteModules : [],
        redirectTo: window.location.origin,
      },
    });
    setSaving(false);

    const errMessage = (data as { error?: string } | null)?.error ?? error?.message;
    if (errMessage) {
      toast({ title: "Could not send invite", description: errMessage, variant: "destructive" });
      return;
    }

    toast({ title: "Invite sent", description: `${inviteEmail} will receive an email to join.` });
    setOpen(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("manager");
    setInviteModules(["dashboard"]);
    load();
  };

  const changeRole = async (member: Member, role: AppRole) => {
    if (!orgId) return;
    const { error } = await supabase
      .from("user_roles")
      .update({ role })
      .eq("user_id", member.id)
      .eq("organization_id", orgId);
    if (error) {
      toast({ title: "Could not change role", description: error.message, variant: "destructive" });
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    if (member.id === user?.id) refresh();
  };

  const toggleModule = async (member: Member, moduleKey: string, enabled: boolean) => {
    if (!orgId) return;
    const { error } = await supabase
      .from("user_module_access")
      .upsert(
        { user_id: member.id, organization_id: orgId, module_key: moduleKey, enabled },
        { onConflict: "user_id,module_key" },
      );
    if (error) {
      toast({ title: "Could not update access", description: error.message, variant: "destructive" });
      return;
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              modules: enabled ? [...m.modules, moduleKey] : m.modules.filter((k) => k !== moduleKey),
            }
          : m,
      ),
    );
    if (member.id === user?.id) refresh();
  };

  const toggleActive = async (member: Member) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !member.is_active })
      .eq("id", member.id);
    if (error) {
      toast({ title: "Could not update member", description: error.message, variant: "destructive" });
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, is_active: !m.is_active } : m)));
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("invitations").update({ status: "revoked" }).eq("id", id);
    if (error) {
      toast({ title: "Could not revoke invite", description: error.message, variant: "destructive" });
      return;
    }
    setInvites((prev) => prev.filter((i) => i.id !== id));
  };

  const activeCount = useMemo(() => members.filter((m) => m.is_active).length, [members]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Team</h2>
          <p className="text-muted-foreground">
            {activeCount} active {activeCount === 1 ? "person" : "people"} in your company
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Set each person's role and, for managers, which sections they can open.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-medium text-foreground">
                          {(member.full_name || member.email || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.full_name || "Unnamed"}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {!member.is_active && <Badge variant="outline">Deactivated</Badge>}
                      {member.id === user?.id && <Badge variant="secondary">You</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role ?? undefined}
                        onValueChange={(v) => changeRole(member, v as AppRole)}
                        disabled={member.id === user?.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(member)}
                        disabled={member.id === user?.id}
                      >
                        {member.is_active ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Reactivate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {member.role === "manager" && (
                    <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-3 lg:grid-cols-5">
                      {MODULES.map((m) => (
                        <label key={m.key} className="flex items-center gap-2 text-sm text-foreground">
                          <Checkbox
                            checked={member.modules.includes(m.key)}
                            onCheckedChange={(c) => toggleModule(member, m.key, c === true)}
                          />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  )}

                  {member.role === "accountant" && (
                    <p className="border-t border-border pt-3 text-sm text-muted-foreground">
                      Fixed access: {ACCOUNTANT_MODULES.join(", ")}
                    </p>
                  )}
                  {member.role === "admin" && (
                    <p className="border-t border-border pt-3 text-sm text-muted-foreground">
                      Full access to every section, the team and company settings.
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {invites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending invites</CardTitle>
                <CardDescription>People who have been emailed but haven't joined yet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {invite.full_name ? `${invite.full_name} · ` : ""}
                          {invite.role}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => revokeInvite(invite.id)}>
                      Revoke
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>They receive an email link to set their password and join your company.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Full name</Label>
              <Input id="inv-name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-email">Email</Label>
              <Input id="inv-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ROLE_OPTIONS.find((r) => r.value === inviteRole)?.hint}
              </p>
            </div>

            {inviteRole === "manager" && (
              <div className="space-y-2">
                <Label>Sections they can open</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MODULES.map((m) => (
                    <label key={m.key} className="flex items-center gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={inviteModules.includes(m.key)}
                        onCheckedChange={() => toggleInviteModule(m.key)}
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendInvite} disabled={saving || !inviteEmail}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
