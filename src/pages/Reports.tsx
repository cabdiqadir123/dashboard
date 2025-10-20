import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, Users, DollarSign, Calendar, RefreshCw, Briefcase, Star, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/useReports";
import { useWorkers } from "@/hooks/useWorkers";
import { useSubServices } from "@/hooks/useSubServices";
import { useCategories } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const { stats, monthlyRevenue, bookingsByStatus, loading, error, exportToCSV, refetch } = useReports();
  const { workers } = useWorkers();
  const { subServices } = useSubServices();
  const { categories } = useCategories();
  const { toast } = useToast();

  const handleExportCSV = async () => {
    const result = await exportToCSV();
    if (result.success) {
      toast({
        title: "Export Successful",
        description: "Report has been exported successfully.",
      });
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export report.",
        variant: "destructive",
      });
    }
  };

  // Worker Analytics
  const topWorkers = [...workers]
    .sort((a, b) => b.total_earnings - a.total_earnings)
    .slice(0, 5);
  
  const totalWorkerEarnings = workers.reduce((acc, w) => acc + w.total_earnings, 0);
  const averageWorkerRating = workers.length > 0 
    ? workers.reduce((acc, w) => acc + w.rating, 0) / workers.length 
    : 0;

  // Sub-Service Analytics
  const topSubServices = [...subServices]
    .sort((a, b) => b.booking_count - a.booking_count)
    .slice(0, 5);
  
  const totalBookings = subServices.reduce((acc, s) => acc + s.booking_count, 0);

  // Category Analytics
  const topCategories = [...categories]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);
  
  const totalCategoryRevenue = categories.reduce((acc, c) => acc + c.total_revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comprehensive Reports & Analytics</h1>
          <p className="text-muted-foreground">Detailed insights across all business operations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-primary text-white hover:opacity-90"
            onClick={handleExportCSV}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading comprehensive report data...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">Error: {error}</div>
      ) : (
        <>
          {/* Overall Business Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">${stats?.totalRevenue.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground">+{stats?.revenueGrowth || 0}% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalBookings.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground">+{stats?.bookingsGrowth || 0}% from last month</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.activeUsers.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground">+{stats?.usersGrowth || 0}% from last month</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalBookings ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">{stats?.completedBookings} completed</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Worker Performance Report */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Top Performing Workers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Worker</span>
                    <span className="text-right">Earnings</span>
                    <span className="text-right">Rating</span>
                  </div>
                  {topWorkers.length > 0 ? (
                    topWorkers.map((worker, index) => (
                      <div key={worker.id} className="grid grid-cols-3 gap-2 items-center p-2 border rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <span className="text-sm font-medium truncate">{worker.name}</span>
                        </div>
                        <span className="text-sm text-success font-semibold text-right">${worker.total_earnings.toFixed(2)}</span>
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          <span className="text-sm font-medium">{worker.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No worker data available</div>
                  )}
                  <div className="pt-3 mt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Worker Earnings:</span>
                      <span className="font-bold text-success">${totalWorkerEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="font-medium">Average Rating:</span>
                      <span className="font-bold">{averageWorkerRating.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Most Booked Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Service</span>
                    <span className="text-right">Bookings</span>
                    <span className="text-right">Price</span>
                  </div>
                  {topSubServices.length > 0 ? (
                    topSubServices.map((service, index) => (
                      <div key={service.id} className="grid grid-cols-3 gap-2 items-center p-2 border rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <span className="text-sm font-medium truncate">{service.name}</span>
                        </div>
                        <span className="text-sm text-primary font-semibold text-right">{service.booking_count}</span>
                        <span className="text-sm font-medium text-right">${service.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No service data available</div>
                  )}
                  <div className="pt-3 mt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Service Bookings:</span>
                      <span className="font-bold text-primary">{totalBookings}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category & Financial Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Top Revenue Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Category</span>
                    <span className="text-right">Revenue</span>
                    <span className="text-right">Services</span>
                  </div>
                  {topCategories.length > 0 ? (
                    topCategories.map((category, index) => (
                      <div key={category.id} className="grid grid-cols-3 gap-2 items-center p-2 border rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                          <span className="text-sm font-medium truncate">{category.name}</span>
                        </div>
                        <span className="text-sm text-success font-semibold text-right">${category.total_revenue.toFixed(2)}</span>
                        <span className="text-sm font-medium text-right">{category.sub_services_count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No category data available</div>
                  )}
                  <div className="pt-3 mt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Category Revenue:</span>
                      <span className="font-bold text-success">${totalCategoryRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthlyRevenue.length > 0 ? (
                    monthlyRevenue.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm font-medium">{item.month}</span>
                        <span className="text-sm text-primary font-semibold">${item.revenue.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No revenue data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Status & Customer Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Bookings by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookingsByStatus.length > 0 ? (
                    bookingsByStatus.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm font-medium capitalize">{item.status}</span>
                        <Badge variant="outline" className="font-semibold">{item.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No booking data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Customer Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded bg-muted/50">
                    <span className="text-sm font-medium">Active Customers</span>
                    <span className="text-lg font-bold text-primary">{stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded bg-muted/50">
                    <span className="text-sm font-medium">Average Order Value</span>
                    <span className="text-lg font-bold text-success">
                      ${stats?.totalBookings ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded bg-muted/50">
                    <span className="text-sm font-medium">Customer Growth Rate</span>
                    <span className="text-lg font-bold text-warning">+{stats?.usersGrowth || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}