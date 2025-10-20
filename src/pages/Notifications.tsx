import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Send, Bell, Users, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

export default function Notifications() {
  const { notifications, loading, error, createNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRecipient = recipientFilter === "all" || notification.recipients === recipientFilter;
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    
    return matchesSearch && matchesRecipient && matchesStatus;
  });

  const handleCreateNotification = async (notificationData: any) => {
    const result: { success: boolean; data?: any; error?: string } = await createNotification({
      title: notificationData.title,
      message: notificationData.message,
      recipients: notificationData.recipients,
      status: notificationData.scheduledAt ? 'scheduled' : 'sent',
      sent_at: notificationData.scheduledAt ? undefined : new Date().toISOString(),
      scheduled_at: notificationData.scheduledAt,
    });

    if (result.success) {
      setIsCreateDialogOpen(false);
      toast({
        title: "Notification Sent",
        description: `Notification ${result.data.status === 'sent' ? 'sent' : 'scheduled'} successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const getRecipientCount = async (recipients: string) => {
    try {
      let count = 0;
      
      if (recipients === 'customers') {
        const { count: customerCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
        count = customerCount || 0;
      } else if (recipients === 'workers') {
        const { count: workerCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'worker');
        count = workerCount || 0;
      } else if (recipients === 'both') {
        const { count: totalCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        count = totalCount || 0;
      }
      
      return count;
    } catch (error) {
      console.error('Error getting recipient count:', error);
      return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };

  const getRecipientColor = (recipients: string) => {
    switch (recipients) {
      case 'customers': return 'default';
      case 'workers': return 'secondary';
      case 'both': return 'outline';
      default: return 'default';
    }
  };

  const sentNotifications = notifications.filter(n => n.status === 'sent').length;
  const scheduledNotifications = notifications.filter(n => n.status === 'scheduled').length;
  const totalRecipients = notifications.reduce((acc, n) => acc + (n.recipient_count || 0), 0);
  const totalReads = notifications.reduce((acc, n) => acc + (n.read_count || 0), 0);
  const readRate = totalRecipients > 0 ? Math.round((totalReads / totalRecipients) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading notifications...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Send notifications to customers and workers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white hover:opacity-90">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send New Notification</DialogTitle>
            </DialogHeader>
            <NotificationForm onSubmit={handleCreateNotification} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold text-foreground">{sentNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-warning">{scheduledNotifications}</p>
              </div>
              <Settings className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold text-foreground">{totalRecipients.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold text-success">{readRate}%</p>
              </div>
              <Bell className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={recipientFilter} onValueChange={setRecipientFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients</SelectItem>
                <SelectItem value="customers">Customers Only</SelectItem>
                <SelectItem value="workers">Workers Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent/Scheduled</TableHead>
                  <TableHead>Recipient Count</TableHead>
                  <TableHead>Read Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRecipientColor(notification.recipients)}>
                        {notification.recipients === 'Both' ? 'Customer & Staff' : 
                         notification.recipients === 'Customer' ? 'Customer' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {notification.sent_at && (
                          <div>{new Date(notification.sent_at).toLocaleString()}</div>
                        )}
                        {notification.scheduled_at && (
                          <div className="text-warning">
                            Scheduled: {new Date(notification.scheduled_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{(notification.recipient_count || 0).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.status === 'sent' && (
                        <div className="text-sm">
                          <div className="font-medium">
                            {Math.round(((notification.read_count || 0) / (notification.recipient_count || 1)) * 100)}%
                          </div>
                          <div className="text-muted-foreground">
                            {(notification.read_count || 0).toLocaleString()} reads
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface NotificationFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function NotificationForm({ onSubmit, onCancel }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipients: "Customer" as 'Customer' | 'Staff' | 'Both',
    scheduleNow: true,
    scheduledAt: ""
  });
  const [recipientCounts, setRecipientCounts] = useState({
    customers: 0,
    workers: 0,
    both: 0
  });

  // Fetch real recipient counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { count: customersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
        
        const { count: workersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'worker');
        
        const { count: totalCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        setRecipientCounts({
          customers: customersCount || 0,
          workers: workersCount || 0,
          both: totalCount || 0
        });
      } catch (error) {
        console.error('Error fetching recipient counts:', error);
      }
    };
    
    fetchCounts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      message: formData.message,
      recipients: formData.recipients,
      scheduledAt: formData.scheduleNow ? undefined : formData.scheduledAt
    });
  };

  const recipientCount = () => {
    switch (formData.recipients) {
      case 'Customer': return `${recipientCounts.customers.toLocaleString()} customers`;
      case 'Staff': return `${recipientCounts.workers.toLocaleString()} workers`;
      case 'Both': return `${recipientCounts.both.toLocaleString()} users (customers & workers)`;
      default: return '0 users';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Notification Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter notification title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="Enter your notification message"
          rows={4}
          required
        />
        <div className="text-xs text-muted-foreground">
          {formData.message.length}/500 characters
        </div>
      </div>

      <div className="space-y-2">
        <Label>Recipients</Label>
        <Select value={formData.recipients} onValueChange={(value: 'Customer' | 'Staff' | 'Both') => setFormData({...formData, recipients: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select recipients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Customer">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customers Only
              </div>
            </SelectItem>
            <SelectItem value="Staff">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Workers Only
              </div>
            </SelectItem>
            <SelectItem value="Both">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Both Customers & Workers
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          Will be sent to {recipientCount()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="scheduleNow"
            checked={formData.scheduleNow}
            onCheckedChange={(checked) => setFormData({...formData, scheduleNow: checked as boolean})}
          />
          <Label htmlFor="scheduleNow">Send immediately</Label>
        </div>

        {!formData.scheduleNow && (
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule for later</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              min={new Date().toISOString().slice(0, 16)}
              required={!formData.scheduleNow}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          <Send className="h-4 w-4 mr-2" />
          {formData.scheduleNow ? 'Send Now' : 'Schedule Notification'}
        </Button>
      </div>
    </form>
  );
}