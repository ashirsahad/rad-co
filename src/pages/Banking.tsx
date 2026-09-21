import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/useCurrency";
import { Landmark, Link2, Plus, Search, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BankAccount {
  id: string;
  name: string;
  number: string;
  type: string;
  balance: number;
}

interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  reconciled: boolean;
  matchedTo?: string;
}

const initialAccounts: BankAccount[] = [
  { id: "acc-1", name: "Business Checking", number: "•••• 4821", type: "Checking", balance: 48250.4 },
  { id: "acc-2", name: "Business Savings", number: "•••• 7710", type: "Savings", balance: 122000 },
  { id: "acc-3", name: "Company Card", number: "•••• 3390", type: "Credit Card", balance: -3420.15 },
];

const initialTransactions: BankTransaction[] = [
  { id: "TX-1001", accountId: "acc-1", date: "2024-12-16", description: "Payment — Tech Solutions Ltd", amount: 15500, reconciled: true, matchedTo: "INV-001" },
  { id: "TX-1002", accountId: "acc-1", date: "2024-12-14", description: "Transfer from Stripe payout", amount: 8250, reconciled: false },
  { id: "TX-1003", accountId: "acc-3", date: "2024-12-12", description: "Adobe Creative Cloud", amount: -450, reconciled: true, matchedTo: "EXP-002" },
  { id: "TX-1004", accountId: "acc-1", date: "2024-12-10", description: "Office rent — December", amount: -2500, reconciled: false },
  { id: "TX-1005", accountId: "acc-1", date: "2024-12-08", description: "Payment — Design Studio Inc", amount: 6750, reconciled: false },
  { id: "TX-1006", accountId: "acc-3", date: "2024-12-05", description: "Airline tickets", amount: -350, reconciled: false },
];

const matchOptions = [
  { value: "INV-002", label: "Invoice INV-002 — Marketing Agency Co" },
  { value: "INV-003", label: "Invoice INV-003 — Consulting Services" },
  { value: "INV-004", label: "Invoice INV-004 — Design Studio Inc" },
  { value: "EXP-001", label: "Expense EXP-001 — Office Rent" },
  { value: "EXP-004", label: "Expense EXP-004 — Travel Expenses" },
  { value: "EXP-005", label: "Expense EXP-005 — Equipment Purchase" },
];

export default function Banking() {
  const { formatCurrency } = useCurrency();
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [transactions, setTransactions] = useState<BankTransaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [matchTx, setMatchTx] = useState<BankTransaction | null>(null);
  const [matchValue, setMatchValue] = useState("");

  const [accountOpen, setAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", number: "", type: "Checking", balance: "" });

  const [txOpen, setTxOpen] = useState(false);
  const [newTx, setNewTx] = useState({ accountId: "acc-1", date: "", description: "", amount: "" });

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (accountFilter !== "all" && t.accountId !== accountFilter) return false;
        if (statusFilter === "reconciled" && !t.reconciled) return false;
        if (statusFilter === "unreconciled" && t.reconciled) return false;
        if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [transactions, accountFilter, statusFilter, search],
  );

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const unreconciled = transactions.filter((t) => !t.reconciled).length;

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const saveMatch = () => {
    if (!matchTx || !matchValue) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === matchTx.id ? { ...t, reconciled: true, matchedTo: matchValue } : t)),
    );
    toast({ title: "Transaction matched", description: `${matchTx.id} is now reconciled with ${matchValue}.` });
    setMatchTx(null);
    setMatchValue("");
  };

  const addAccount = () => {
    if (!newAccount.name) return;
    setAccounts((prev) => [
      ...prev,
      {
        id: `acc-${Date.now()}`,
        name: newAccount.name,
        number: newAccount.number || "•••• 0000",
        type: newAccount.type,
        balance: Number(newAccount.balance) || 0,
      },
    ]);
    setNewAccount({ name: "", number: "", type: "Checking", balance: "" });
    setAccountOpen(false);
  };

  const addTransaction = () => {
    if (!newTx.description) return;
    setTransactions((prev) => [
      {
        id: `TX-${Date.now()}`,
        accountId: newTx.accountId,
        date: newTx.date || new Date().toISOString().slice(0, 10),
        description: newTx.description,
        amount: Number(newTx.amount) || 0,
        reconciled: false,
      },
      ...prev,
    ]);
    setNewTx({ accountId: "acc-1", date: "", description: "", amount: "" });
    setTxOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Banking</h2>
          <p className="text-muted-foreground">Accounts, transactions and reconciliation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAccountOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add account
          </Button>
          <Button size="sm" onClick={() => setTxOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total balance</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unreconciled</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{unreconciled}</div>
            <p className="text-xs text-muted-foreground">Transactions awaiting a match</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reconciled</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{transactions.length - unreconciled}</div>
            <p className="text-xs text-muted-foreground">Matched to invoices or expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{account.name}</CardTitle>
              <CardDescription>
                {account.type} · {account.number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{formatCurrency(account.balance)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unreconciled">Unreconciled</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Match a transaction to an invoice or expense to reconcile it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{tx.description}</p>
                <p className="text-sm text-muted-foreground">
                  {tx.date} · {accountName(tx.accountId)} · {tx.id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {tx.reconciled ? (
                  <Badge variant="default">Reconciled{tx.matchedTo ? ` · ${tx.matchedTo}` : ""}</Badge>
                ) : (
                  <Badge variant="secondary">Unreconciled</Badge>
                )}
                <p className={`font-medium ${tx.amount < 0 ? "text-muted-foreground" : "text-foreground"}`}>
                  {formatCurrency(tx.amount)}
                </p>
                {!tx.reconciled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMatchTx(tx);
                      setMatchValue("");
                    }}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Match
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions match these filters.</p>
          )}
        </CardContent>
      </Card>

      {/* Match dialog */}
      <Dialog open={!!matchTx} onOpenChange={(o) => !o && setMatchTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match transaction</DialogTitle>
            <DialogDescription>{matchTx?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Match to</Label>
            <Select value={matchValue} onValueChange={setMatchValue}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an invoice or expense" />
              </SelectTrigger>
              <SelectContent>
                {matchOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchTx(null)}>
              Cancel
            </Button>
            <Button onClick={saveMatch} disabled={!matchValue}>
              Reconcile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add account dialog */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add bank account</DialogTitle>
            <DialogDescription>Track another account alongside your books.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="acc-name">Account name</Label>
              <Input id="acc-name" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acc-num">Last 4 digits</Label>
                <Input id="acc-num" value={newAccount.number} onChange={(e) => setNewAccount({ ...newAccount, number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newAccount.type} onValueChange={(v) => setNewAccount({ ...newAccount, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checking">Checking</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-bal">Opening balance</Label>
              <Input id="acc-bal" type="number" value={newAccount.balance} onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addAccount}>Add account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add transaction dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add transaction</DialogTitle>
            <DialogDescription>Use a negative amount for money leaving the account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={newTx.accountId} onValueChange={(v) => setNewTx({ ...newTx, accountId: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-desc">Description</Label>
              <Input id="tx-desc" value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-date">Date</Label>
                <Input id="tx-date" type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-amt">Amount</Label>
                <Input id="tx-amt" type="number" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTxOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTransaction}>Add transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
