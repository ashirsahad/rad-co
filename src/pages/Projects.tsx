import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Folder, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  timeTracked: number;
  estimatedHours: number;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  tasks: {
    total: number;
    completed: number;
  };
}

export default function Projects() {
  const { t } = useTranslation('common');
  const { formatCurrency } = useCurrency();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      client: 'Acme Corp',
      description: 'Complete redesign of corporate website with new branding',
      status: 'active',
      progress: 65,
      startDate: '2024-01-01',
      endDate: '2024-03-15',
      budget: 25000,
      spent: 16250,
      timeTracked: 120,
      estimatedHours: 200,
      teamMembers: [
        { id: '1', name: 'John Doe', role: 'Designer' },
        { id: '2', name: 'Jane Smith', role: 'Developer' },
        { id: '3', name: 'Mike Johnson', role: 'Project Manager' }
      ],
      tasks: { total: 24, completed: 16 }
    },
    {
      id: '2',
      name: 'Mobile App Development',
      client: 'Tech Solutions',
      description: 'iOS and Android app for customer management',
      status: 'active',
      progress: 40,
      startDate: '2024-02-01',
      endDate: '2024-06-30',
      budget: 50000,
      spent: 20000,
      timeTracked: 180,
      estimatedHours: 400,
      teamMembers: [
        { id: '4', name: 'Sarah Wilson', role: 'Mobile Developer' },
        { id: '5', name: 'Tom Brown', role: 'UI/UX Designer' },
        { id: '6', name: 'Lisa Chen', role: 'QA Engineer' }
      ],
      tasks: { total: 35, completed: 14 }
    },
    {
      id: '3',
      name: 'Data Migration',
      client: 'Global Industries',
      description: 'Legacy system data migration to cloud platform',
      status: 'completed',
      progress: 100,
      startDate: '2023-11-01',
      endDate: '2024-01-15',
      budget: 15000,
      spent: 14500,
      timeTracked: 95,
      estimatedHours: 100,
      teamMembers: [
        { id: '7', name: 'David Lee', role: 'Data Engineer' },
        { id: '8', name: 'Emma Davis', role: 'Systems Analyst' }
      ],
      tasks: { total: 18, completed: 18 }
    },
    {
      id: '4',
      name: 'Marketing Campaign',
      client: 'StartupCo',
      description: 'Digital marketing campaign for product launch',
      status: 'on-hold',
      progress: 25,
      startDate: '2024-01-15',
      endDate: '2024-04-30',
      budget: 8000,
      spent: 2000,
      timeTracked: 30,
      estimatedHours: 80,
      teamMembers: [
        { id: '9', name: 'Alex Rodriguez', role: 'Marketing Specialist' },
        { id: '10', name: 'Rachel Green', role: 'Content Writer' }
      ],
      tasks: { total: 12, completed: 3 }
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'on-hold': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
  const activeProjects = projects.filter(project => project.status === 'active').length;
  const totalTimeTracked = projects.reduce((sum, project) => sum + project.timeTracked, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Project Management</h2>
          <p className="text-muted-foreground">
            Track and manage your projects and time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeTracked}h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {filterStatus === 'all' ? 'All' : filterStatus.replace('-', ' ')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('on-hold')}>
                    On Hold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('cancelled')}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {project.client}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Tasks */}
              <div className="flex justify-between text-sm">
                <span>Tasks:</span>
                <span>{project.tasks.completed}/{project.tasks.total}</span>
              </div>

              {/* Budget */}
              <div className="flex justify-between text-sm">
                <span>Budget:</span>
                <span>{formatCurrency(project.spent)} / {formatCurrency(project.budget)}</span>
              </div>

              {/* Time */}
              <div className="flex justify-between text-sm">
                <span>Time:</span>
                <span>{project.timeTracked}h / {project.estimatedHours}h</span>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Team:</span>
                <div className="flex -space-x-2">
                  {project.teamMembers.slice(0, 4).map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.teamMembers.length > 4 && (
                    <div className="h-8 w-8 border-2 border-background rounded-full bg-muted flex items-center justify-center text-xs">
                      +{project.teamMembers.length - 4}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Project</DropdownMenuItem>
                    <DropdownMenuItem>Add Task</DropdownMenuItem>
                    <DropdownMenuItem>Time Tracking</DropdownMenuItem>
                    <DropdownMenuItem>Generate Report</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Archive Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}