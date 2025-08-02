import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: "revenue" | "expense" | "client" | "invoice";
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  subtitle, 
  icon: Icon,
  colorScheme = "revenue"
}: StatCardProps) {
  const getBgColor = () => {
    switch (colorScheme) {
      case "revenue": return "bg-revenue";
      case "expense": return "bg-expense";
      case "client": return "bg-client";
      case "invoice": return "bg-invoice";
      default: return "bg-card";
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-sm", getBgColor())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(change || subtitle) && (
          <div className="flex items-center justify-between mt-1">
            {change && (
              <p className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}