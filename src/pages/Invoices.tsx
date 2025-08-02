import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Download, Eye } from "lucide-react";

const invoices = [
  {
    id: "INV-001",
    client: "Tech Solutions Ltd",
    amount: 15500,
    date: "2024-12-15",
    dueDate: "2024-12-30",
    status: "paid"
  },
  {
    id: "INV-002",
    client: "Marketing Agency Co",
    amount: 8250,
    date: "2024-12-12",
    dueDate: "2024-12-27",
    status: "pending"
  },
  {
    id: "INV-003",
    client: "Consulting Services",
    amount: 12800,
    date: "2024-12-08",
    dueDate: "2024-12-23",
    status: "overdue"
  },
  {
    id: "INV-004",
    client: "Design Studio Inc",
    amount: 6750,
    date: "2024-12-05",
    dueDate: "2024-12-20",
    status: "draft"
  },
  {
    id: "INV-005",
    client: "E-commerce Co",
    amount: 22300,
    date: "2024-12-01",
    dueDate: "2024-12-16",
    status: "paid"
  }
];

export default function Invoices() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h2>
          <p className="text-muted-foreground">
            Manage your invoices and billing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-8" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            A list of all your invoices including their status and amounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
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
                    <p className="font-medium text-foreground">${invoice.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}