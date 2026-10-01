import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";

interface AuditRow {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const LABELS: Record<string, string> = {
  sign_in: "Signed in",
  role_changed: "Role changed",
  permission_updated: "Access updated",
  member_status_changed: "Member status",
  invoice_created: "Invoice created",
  invoice_updated: "Invoice edited",
  expense_created: "Expense added",
  expense_updated: "Expense edited",
  transaction_reconciled: "Reconciled",
};

const GROUPS: Record<string, string[]> = {
  all: [],
  auth: ["sign_in"],
  access: ["role_changed", "permission_updated", "member_status_changed"],
  invoices: ["invoice_created", "invoice_updated"],
  expenses: ["expense_created", "expense_updated"],
  banking: ["transaction_reconciled"],
};

function describe(r: AuditRow) {
  const d = r.details ?? {};
  switch (r.action) {
    case "role_changed":
      return `${d.member ?? "Member"}: ${d.from} → ${d.to}`;
    case "permission_updated":
      return `${d.member ?? "Member"}: ${d.module} ${d.enabled ? "enabled" : "disabled"}`;
    case "member_status_changed":
      return `${d.member ?? "Member"} ${d.active ? "reactivated" : "deactivated"}`;
    case "transaction_reconciled":
      return `${r.entity_id} matched to ${d.matchedTo}`;
    case "sign_in":
      return String(d.method ?? "");
    default:
      return [r.entity_id, d.status, d.total ?? d.amount].filter(Boolean).join(" · ");
  }
}

export default function AuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");

  const load = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("audit_logs")
      .select("id, actor_email, action, entity_type, entity_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data ?? []) as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (group === "all" || GROUPS[group].includes(r.action)) &&
        (!q || `${r.actor_email} ${r.entity_id} ${describe(r)}`.toLowerCase().includes(q)),
    );
  }, [rows, search, group]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Audit log</h2>
          <p className="text-muted-foreground">Who did what, and when, across your company.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Sign-ins, role and access changes, invoice and expense edits, and reconciliations.</CardDescription>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Input placeholder="Search person, record or detail…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                <SelectItem value="auth">Sign-ins</SelectItem>
                <SelectItem value="access">Roles & access</SelectItem>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="banking">Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-sm">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{r.actor_email ?? "System"}</TableCell>
                    <TableCell><Badge variant="outline">{LABELS[r.action] ?? r.action}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{describe(r)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
