import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Filter, Mail, Phone, MapPin } from "lucide-react";

const clients = [
  {
    id: "1",
    name: "Tech Solutions Ltd",
    email: "contact@techsolutions.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, Silicon Valley, CA",
    totalInvoices: 12,
    totalRevenue: 45600,
    status: "active"
  },
  {
    id: "2", 
    name: "Marketing Agency Co",
    email: "hello@marketingagency.com",
    phone: "+1 (555) 234-5678",
    address: "456 Marketing Ave, New York, NY",
    totalInvoices: 8,
    totalRevenue: 28400,
    status: "active"
  },
  {
    id: "3",
    name: "Consulting Services",
    email: "info@consulting.com", 
    phone: "+1 (555) 345-6789",
    address: "789 Business Blvd, Chicago, IL",
    totalInvoices: 15,
    totalRevenue: 67200,
    status: "active"
  },
  {
    id: "4",
    name: "Design Studio Inc",
    email: "contact@designstudio.com",
    phone: "+1 (555) 456-7890", 
    address: "321 Creative Lane, Austin, TX",
    totalInvoices: 6,
    totalRevenue: 19800,
    status: "inactive"
  },
  {
    id: "5",
    name: "E-commerce Co",
    email: "support@ecommerce.com",
    phone: "+1 (555) 567-8901",
    address: "654 Commerce St, Seattle, WA", 
    totalInvoices: 20,
    totalRevenue: 89500,
    status: "active"
  }
];

export default function Clients() {
  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client relationships and information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-8" />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <Badge variant={getStatusColor(client.status)} className="mt-1">
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{client.phone}</span>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{client.address}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{client.totalInvoices}</p>
                    <p className="text-xs text-muted-foreground">Invoices</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">${client.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}