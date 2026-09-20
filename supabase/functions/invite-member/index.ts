import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ROLES = ["admin", "manager", "accountant"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Not authenticated" }, 401);
    const caller = userData.user;

    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim().slice(0, 120) : "";
    const role = typeof body?.role === "string" ? body.role : "";
    const modules: string[] = Array.isArray(body?.modules)
      ? body.modules.filter((m: unknown) => typeof m === "string").slice(0, 30)
      : [];

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Enter a valid email address" }, 400);
    if (!ROLES.includes(role)) return json({ error: "Invalid role" }, 400);

    const admin = createClient(url, serviceKey);

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role, organization_id")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (!callerRole || callerRole.role !== "admin") {
      return json({ error: "Only an admin can invite team members" }, 403);
    }
    const organizationId = callerRole.organization_id;

    const redirectTo = typeof body?.redirectTo === "string" && body.redirectTo.startsWith("http")
      ? body.redirectTo
      : undefined;

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        full_name: fullName,
        organization_id: organizationId,
        role,
        modules,
      },
    });

    if (inviteError) {
      return json({ error: inviteError.message }, 400);
    }

    const { error: rowError } = await admin.from("invitations").insert({
      organization_id: organizationId,
      email,
      full_name: fullName,
      role,
      modules,
      invited_by: caller.id,
    });
    if (rowError) return json({ error: rowError.message }, 400);

    return json({ success: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
