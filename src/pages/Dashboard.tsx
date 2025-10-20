import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useRecentBookings } from "@/hooks/useRecentBookings";
import { useTopWorkers } from "@/hooks/useTopWorkers";
import { useNavigate } from "react-router-dom";

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    case "confirmed":
      return <Badge className="bg-primary text-primary-foreground">Confirmed</Badge>;
    case "pending":
      return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${
        i < rating ? "fill-warning text-warning" : "text-muted-foreground"
      }`}
    />
  ));
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useStats();
  const { bookings, loading: bookingsLoading } = useRecentBookings(4);
  const { workers, loading: workersLoading } = useTopWorkers(5);

  const dashboardStats = [
    {
      title: "Total Users",
      value: (stats?.totalUsers || 0).toLocaleString(),
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Active Workers",
      value: (stats?.activeWorkers || 0).toString(),
      change: "+3% from last month",
      changeType: "positive" as const,
      icon: UserCheck,
    },
    {
      title: "Total Bookings",
      value: (stats?.totalBookings || 0).toLocaleString(),
      change: "+23% from last month",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Monthly Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+18% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
    },
  ];

  if (statsLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('in page',workers.length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your service platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Bookings */}
        <Card className="col-span-4 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
            <CardDescription>
              Latest service bookings from your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent bookings found
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{booking.customer_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{booking.customer_name}</p>
                          <span className="text-xs text-muted-foreground">#{booking.booking_number}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Worker: {booking.worker_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">${booking.final_price}</p>
                      {getStatusBadge(booking.status)}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/bookings")}
              >
                View All Bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Workers */}
        <Card className="col-span-3 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Workers
            </CardTitle>
            <CardDescription>
              Best performing workers this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : workers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No workers found
                </div>
              ) : (
                workers.map((worker, index) => (
                  <div key={worker.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {worker.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {worker.service}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(worker.rating))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({worker.rating.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        ${worker.hourly_rate}/hr
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {worker.total_jobs} jobs
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/workers")}
              >
                View All Workers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}