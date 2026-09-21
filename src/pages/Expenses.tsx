import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/Expense/ExpenseForm";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Receipt, Calendar, Pencil } from "lucide-react";

interface ExpenseRow {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  status: string;
  receipt: boolean;
  raw?: any;
}

const initialExpenses: ExpenseRow[] = [
  { id: "EXP-001", description: "Office Rent", amount: 2500, currency: "USD", date: "2024-12-01", category: "Rent", status: "paid", receipt: true },
  { id: "EXP-002", description: "Software Licenses", amount: 450, currency: "USD", date: "2024-12-03", category: "Software & Subscriptions", status: "paid", receipt: true },
  { id: "EXP-003", description: "Marketing Campaign", amount: 1200, currency: "USD", date: "2024-12-05", category: "Marketing", status: "pending", receipt: false },
  { id: "EXP-004", description: "Travel Expenses", amount: 350, currency: "USD", date: "2024-12-08", category: "Travel", status: "paid", receipt: true },
  { id: "EXP-005", description: "Equipment Purchase", amount: 850, currency: "USD", date: "2024-12-10", category: "Equipment", status: "pending", receipt: false },
];

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export default function Expenses() {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(expenses.map((e) => e.category)))],
    [expenses],
  );

  const getStatusColor = (status: string) => (status === "paid" || status === "approved" ? "default" : "secondary");

  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        if (category !== "All" && e.category !== category) return false;
        if (search && !`${e.id} ${e.description}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [expenses, category, search],
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses
    .filter((e) => e.status === "paid" || e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = totalExpenses - paidExpenses;

  const handleSave = (expense: any) => {
    const row: ExpenseRow = {
      id: editing?.id ?? `EXP-${String(expenses.length + 1).padStart(3, "0")}`,
      description: expense.description || "Untitled expense",
      amount: Number(expense.amount) || 0,
      currency: expense.currency,
      date: fmt(new Date(expense.date)),
      category: expense.category || "Other",
      status: expense.status === "approved" ? "paid" : expense.status,
      receipt: !!expense.receipt,
      raw: expense,
    };

    setExpenses((prev) => {
      const idx = editing ? prev.findIndex((p) => p.id === editing.id) : -1;
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = row;
        return next;
      }
      return [row, ...prev];
    });

    toast({ title: editing ? "Expense updated" : "Expense added", description: row.description });
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Expenses</h2>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-expense">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(paidExpenses)}</div>
            <p className="text-xs text-muted-foreground">Processed expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(pendingExpenses)}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button
              key={c}
              variant={category === c ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>A detailed list of your business expenses and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{expense.category}</Badge>
                    <Badge variant={getStatusColor(expense.status)}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                    {expense.receipt && (
                      <Badge variant="outline" className="text-xs">
                        Receipt
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {expense.date}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(expense);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No expenses match your search.</p>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <ExpenseForm
            expense={
              editing?.raw ?? (editing
                ? {
                    description: editing.description,
                    amount: editing.amount,
                    currency: editing.currency,
                    category: editing.category,
                    date: new Date(editing.date),
                    vendor: "",
                    paymentMethod: "Credit Card",
                    notes: "",
                    billable: false,
                    status: "pending" as const,
                    tags: [],
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
