import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Receipt, Calendar } from "lucide-react";

const expenses = [
  {
    id: "EXP-001",
    description: "Office Rent",
    amount: 2500,
    date: "2024-12-01",
    category: "Office",
    status: "paid",
    receipt: true
  },
  {
    id: "EXP-002", 
    description: "Software Licenses",
    amount: 450,
    date: "2024-12-03",
    category: "Software",
    status: "paid",
    receipt: true
  },
  {
    id: "EXP-003",
    description: "Marketing Campaign",
    amount: 1200,
    date: "2024-12-05",
    category: "Marketing",
    status: "pending",
    receipt: false
  },
  {
    id: "EXP-004",
    description: "Travel Expenses",
    amount: 350,
    date: "2024-12-08",
    category: "Travel",
    status: "paid",
    receipt: true
  },
  {
    id: "EXP-005",
    description: "Equipment Purchase",
    amount: 850,
    date: "2024-12-10",
    category: "Equipment",
    status: "pending",
    receipt: false
  }
];

const categories = ["All", "Office", "Software", "Marketing", "Travel", "Equipment"];

export default function Expenses() {
  const getStatusColor = (status: string) => {
    return status === "paid" ? "default" : "secondary";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Office: "bg-blue-100 text-blue-800",
      Software: "bg-green-100 text-green-800", 
      Marketing: "bg-purple-100 text-purple-800",
      Travel: "bg-orange-100 text-orange-800",
      Equipment: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = expenses.filter(exp => exp.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === "pending").reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Expenses</h2>
          <p className="text-muted-foreground">
            Track and manage your business expenses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-expense">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${paidExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Processed expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${pendingExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-8" />
        </div>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button key={category} variant="outline" size="sm">
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            A detailed list of your business expenses and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getCategoryColor(expense.category)}>
                      {expense.category}
                    </Badge>
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
                    <p className="font-medium text-foreground">${expense.amount.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {expense.date}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}