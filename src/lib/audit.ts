import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "sign_in"
  | "role_changed"
  | "permission_updated"
  | "member_status_changed"
  | "invoice_created"
  | "invoice_updated"
  | "expense_created"
  | "expense_updated"
  | "transaction_reconciled";

/** Records an action for the signed-in user's company. Never throws — logging must not block the app. */
export async function logAudit(
  action: AuditAction,
  entityType: string,
  entityId?: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, email")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.organization_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("audit_logs").insert({
      organization_id: profile.organization_id,
      actor_id: user.id,
      actor_email: profile.email ?? user.email,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details,
    });
  } catch (e) {
    console.warn("audit log failed", e);
  }
}
