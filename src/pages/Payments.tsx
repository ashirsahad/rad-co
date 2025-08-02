import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, CreditCard, Banknote, Smartphone, Calendar } from "lucide-react";

const payments = [
  {
    id: "PAY-001",
    invoiceId: "INV-001",
    client: "Tech Solutions Ltd",
    amount: 15500,
    date: "2024-12-15",
    method: "credit_card",
    status: "completed",
    reference: "ch_1234567890"
  },
  {
    id: "PAY-002",
    invoiceId: "INV-005",
    client: "E-commerce Co", 
    amount: 22300,
    date: "2024-12-14",
    method: "bank_transfer",
    status: "completed",
    reference: "TXN-9876543210"
  },
  {
    id: "PAY-003",
    invoiceId: "INV-002",
    client: "Marketing Agency Co",
    amount: 8250,
    date: "2024-12-12",
    method: "mobile_payment",
    status: "processing",
    reference: "MP-5555444433"
  },
  {
    id: "PAY-004",
    invoiceId: "INV-004",
    client: "Design Studio Inc",
    amount: 6750,
    date: "2024-12-10",
    method: "credit_card",
    status: "failed",
    reference: "ch_0987654321"
  },
  {
    id: "PAY-005",
    invoiceId: "INV-003",
    client: "Consulting Services",
    amount: 12800,
    date: "2024-12-08",
    method: "bank_transfer", 
    status: "pending",
    reference: "TXN-1122334455"
  }
];

export default function Payments() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "processing": return "secondary";
      case "pending": return "outline";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card": return CreditCard;
      case "bank_transfer": return Banknote;
      case "mobile_payment": return Smartphone;
      default: return CreditCard;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card": return "Credit Card";
      case "bank_transfer": return "Bank Transfer";
      case "mobile_payment": return "Mobile Payment";
      default: return "Unknown";
    }
  };

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === "completed").reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "processing").reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Payments</h2>
          <p className="text-muted-foreground">
            Track and manage payment transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${completedPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Processing or pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." className="pl-8" />
        </div>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            A complete record of all payment transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => {
              const MethodIcon = getMethodIcon(payment.method);
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <MethodIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{payment.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.client} • {payment.invoiceId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {getMethodLabel(payment.method)}
                      </Badge>
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">${payment.amount.toLocaleString()}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {payment.date}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}