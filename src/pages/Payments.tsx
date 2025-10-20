import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, DollarSign, CreditCard, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/usePayments";

// Fix build errors by removing duplicate interface that conflicts with usePayments hook

export default function Payments() {
  const { payments, loading, error, updatePaymentStatus } = usePayments();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      String(payment.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payment.booking_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(payment.phone).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });


  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailDialogOpen(true);
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: 'Pending' | 'Completed' | 'Refunded') => {
    const result = await updatePaymentStatus(paymentId, newStatus);
    if (result.success) {
      toast({
        title: "Payment Status Updated",
        description: "Payment status has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Completed': return 'default';
      case 'Refunded': return 'secondary';
      default: return 'default';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const statusCounts = {
    pending: payments.filter(p => p.status === 'Pending').length,
    completed: payments.filter(p => p.status === 'Completed').length,
    refunded: payments.filter(p => p.status === 'Refunded').length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading payments...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments Management</h1>
          <p className="text-muted-foreground">Monitor transactions and payment statuses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-warning">${pendingAmount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{statusCounts.completed}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold text-destructive">{statusCounts.refunded}</p>
              </div>
              <CreditCard className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payments Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.id}</div>
                      <div className="text-xs text-muted-foreground">{payment.booking_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm">
                          S
                        </div>
                        <div>
                          <div className="font-medium">{payment.customer_name || 'Service'}</div>
                          <div className="text-sm text-muted-foreground">{payment.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.booking_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lg">${payment.amount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={payment.status}
                        onValueChange={(value: 'Pending' | 'Completed' | 'Refunded') => handleUpdateStatus(payment.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <Badge variant={getStatusColor(payment.status)} className="border-none">
                            {payment.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(payment as any)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && <PaymentDetails payment={selectedPayment} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaymentDetails({ payment }: { payment: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Payment ID</Label>
          <p className="text-sm">{payment.id}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Booking ID</Label>
          <p className="text-sm">{payment.booking_id}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-1">
            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
              {payment.status}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Service</Label>
          <p className="text-sm">{payment.service_name || 'Service'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Amount</Label>
          <p className="text-lg font-bold">${payment.amount}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Payment Method</Label>
          <p className="text-sm capitalize">{payment.method?.replace('_', ' ')}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Created At</Label>
          <p className="text-sm">{new Date(payment.created_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}