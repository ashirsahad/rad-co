import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceForm } from "@/components/Invoice/InvoiceForm";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Download, Pencil } from "lucide-react";

interface InvoiceRow {
  id: string;
  client: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: string;
  raw?: any;
}

const initialInvoices: InvoiceRow[] = [
  { id: "INV-001", client: "Tech Solutions Ltd", amount: 15500, currency: "USD", date: "2024-12-15", dueDate: "2024-12-30", status: "paid" },
  { id: "INV-002", client: "Marketing Agency Co", amount: 8250, currency: "USD", date: "2024-12-12", dueDate: "2024-12-27", status: "pending" },
  { id: "INV-003", client: "Consulting Services", amount: 12800, currency: "USD", date: "2024-12-08", dueDate: "2024-12-23", status: "overdue" },
  { id: "INV-004", client: "Design Studio Inc", amount: 6750, currency: "USD", date: "2024-12-05", dueDate: "2024-12-20", status: "draft" },
  { id: "INV-005", client: "E-commerce Co", amount: 22300, currency: "USD", date: "2024-12-01", dueDate: "2024-12-16", status: "paid" },
];

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export default function Invoices() {
  const { formatCurrency } = useCurrency();
  const [invoices, setInvoices] = useState<InvoiceRow[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceRow | null>(null);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "paid": return "default" as const;
      case "pending": return "secondary" as const;
      case "overdue": return "destructive" as const;
      case "draft": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        if (status !== "all" && inv.status !== status) return false;
        if (search && !`${inv.id} ${inv.client}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [invoices, status, search],
  );

  const handleSave = (invoice: any) => {
    const row: InvoiceRow = {
      id: invoice.invoiceNumber,
      client: invoice.clientId || "Unassigned client",
      amount: invoice.total,
      currency: invoice.currency,
      date: fmt(new Date(invoice.issueDate)),
      dueDate: fmt(new Date(invoice.dueDate)),
      status: invoice.status === "sent" ? "pending" : invoice.status,
      raw: invoice,
    };

    setInvoices((prev) => {
      const idx = editing ? prev.findIndex((p) => p.id === editing.id) : -1;
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = row;
        return next;
      }
      return [row, ...prev];
    });

    toast({ title: editing ? "Invoice updated" : "Invoice created", description: row.id });
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h2>
          <p className="text-muted-foreground">Manage your invoices and billing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>A list of all your invoices including their status and amounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-foreground">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client}</p>
                  </div>
                  <Badge variant={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(invoice);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No invoices match your search.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice details</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={
              editing?.raw ?? (editing
                ? {
                    invoiceNumber: editing.id,
                    clientId: editing.client,
                    issueDate: new Date(editing.date),
                    dueDate: new Date(editing.dueDate),
                    currency: editing.currency,
                    items: [],
                    notes: "",
                    terms: "",
                    subtotal: editing.amount,
                    taxTotal: 0,
                    total: editing.amount,
                    status: "draft",
                  }
                : undefined)
            }
            onSave={handleSave}
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
