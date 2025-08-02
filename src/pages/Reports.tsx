import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, FileText, Users, TrendingDown } from "lucide-react";

export default function Reports() {
  const reportTypes = [
    {
      title: "Revenue Report",
      description: "Monthly and yearly revenue analysis",
      icon: DollarSign,
      lastGenerated: "Dec 15, 2024",
      status: "ready"
    },
    {
      title: "Invoice Summary", 
      description: "Invoice status and aging report",
      icon: FileText,
      lastGenerated: "Dec 10, 2024",
      status: "ready"
    },
    {
      title: "Client Analysis",
      description: "Client revenue and activity report",
      icon: Users,
      lastGenerated: "Dec 8, 2024", 
      status: "ready"
    },
    {
      title: "Expense Report",
      description: "Categorized expense breakdown",
      icon: TrendingDown,
      lastGenerated: "Dec 12, 2024",
      status: "ready"
    },
    {
      title: "Profit & Loss",
      description: "P&L statement for the current period",
      icon: TrendingUp,
      lastGenerated: "Dec 1, 2024",
      status: "pending"
    },
    {
      title: "Tax Summary",
      description: "Tax-ready financial summary",
      icon: BarChart3,
      lastGenerated: "Nov 30, 2024",
      status: "ready"
    }
  ];

  const quickStats = [
    { label: "Total Revenue", value: "$125,430", change: "+12.5%" },
    { label: "Outstanding Amount", value: "$32,150", change: "-8.2%" },
    { label: "Total Expenses", value: "$18,920", change: "+3.1%" },
    { label: "Net Profit", value: "$106,510", change: "+15.3%" }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Reports</h2>
          <p className="text-muted-foreground">
            Generate and view financial reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.change}
                  </p>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Generated:</span>
                <span className="text-foreground">{report.lastGenerated}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'ready' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-warning/10 text-warning'
                }`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  disabled={report.status === 'pending'}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={report.status === 'pending'}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Monthly revenue over the past 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-sm text-muted-foreground">Connect to a charting library for detailed analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}