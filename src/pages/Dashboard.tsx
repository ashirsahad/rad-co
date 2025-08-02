import { StatCard } from "@/components/Dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  FileText, 
  TrendingDown, 
  Users,
  Plus,
  Eye,
  CreditCard,
  BarChart3
} from "lucide-react";

const recentInvoices = [
  {
    id: "INV-001",
    client: "Tech Solutions Ltd",
    amount: "15,500",
    date: "Dec 15, 2024",
    status: "paid"
  },
  {
    id: "INV-002",
    client: "Marketing Agency Co",
    amount: "8,250",
    date: "Dec 12, 2024",
    status: "pending"
  },
  {
    id: "INV-003",
    client: "Consulting Services",
    amount: "12,800",
    date: "Dec 8, 2024",
    status: "overdue"
  }
];

const quickActions = [
  { title: "Create Invoice", icon: FileText, action: "invoice" },
  { title: "Add Client", icon: Users, action: "client" },
  { title: "Record Expense", icon: TrendingDown, action: "expense" },
  { title: "View Reports", icon: BarChart3, action: "reports" }
];

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Welcome back! Here's your business overview.
      </p>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$125,430"
          change="+12.5%"
          changeType="positive"
          subtitle="This month"
          icon={DollarSign}
          colorScheme="revenue"
        />
        <StatCard
          title="Outstanding"
          value="$32,150"
          change="-8.2%"
          changeType="negative"
          subtitle="Pending invoices"
          icon={FileText}
          colorScheme="invoice"
        />
        <StatCard
          title="Expenses"
          value="$18,920"
          change="+3.1%"
          changeType="positive"
          subtitle="This month"
          icon={TrendingDown}
          colorScheme="expense"
        />
        <StatCard
          title="Active Clients"
          value="48"
          change="+5"
          changeType="positive"
          subtitle="Total clients"
          icon={Users}
          colorScheme="client"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Invoices */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Invoices</CardTitle>
                <CardDescription>
                  Latest invoice activity
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">${invoice.amount}</p>
                    <Badge 
                      variant={
                        invoice.status === "paid" ? "default" : 
                        invoice.status === "pending" ? "secondary" : 
                        "destructive"
                      }
                      className="text-xs"
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                className="justify-start h-12"
              >
                <action.icon className="mr-3 h-4 w-4" />
                {action.title}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}