import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, DollarSign, Clock, MapPin, User, Settings, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/useBookings";
import { useWorkers } from "@/hooks/useWorkers";
import axios from "axios";

export default function Bookings() {
  const [booking_sub_services, setbooking_sub_services] = useState([]);
  const fetch_booking_sub_services = async (id) => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/all_booking_sub_services/" + id);
    const resltdata = rptdata.data;
    setbooking_sub_services(resltdata);
  };
  const { bookings, loading, error, updateBookingStatus, assignWorker, updateBookingPrice } = useBookings();
  const { workers } = useWorkers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isPriceEditDialogOpen, setIsPriceEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      (booking.customer_name?.toString().toLowerCase().includes(searchLower)) ||
      (booking.booking_number?.toString().toLowerCase().includes(searchLower)) ||
      (booking.id?.toString().toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
    fetch_booking_sub_services(booking.booking_number)
  };

  const handleAssignWorker = (booking: any) => {
    setSelectedBooking(booking);
    setIsAssignDialogOpen(true);
  };

  const handleEditPrice = (booking: any) => {
    setSelectedBooking(booking);
    setIsPriceEditDialogOpen(true);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: any) => {
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully.",
      });
    }
  };

  const handleWorkerAssignment = async (bookingId: string, workerId: string) => {
    const result = await assignWorker(bookingId, workerId);
    if (result.success) {
      setIsAssignDialogOpen(false);
      toast({
        title: "Worker Assigned",
        description: "Worker has been assigned to the booking successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to assign worker",
        variant: "destructive",
      });
    }
  };

  const handlePriceUpdate = async (bookingId: string, newAmount: number, reason: string) => {
    const result = await updateBookingPrice(bookingId, newAmount, reason);
    if (result.success) {
      setIsPriceEditDialogOpen(false);
      toast({
        title: "Price Updated",
        description: "Booking price has been updated successfully.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Confirmed': return 'default';
      case 'Completed': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'Completed')
    .reduce((acc, b) => acc + (b.final_price || 0), 0);

  const statusCounts = {
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    completed: bookings.filter(b => b.status === 'Completed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground">Monitor and manage service bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{statusCounts.pending}</p>
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
              <Calendar className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Bookings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.booking_number}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm">
                          {booking.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{booking.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.service_name}</div>
                        <div className="text-sm text-muted-foreground">{booking.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.worker_name ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {booking.worker_name}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignWorker(booking)}
                        >
                          Assign Worker
                        </Button>
                      )}
                      {booking.worker_name && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignWorker(booking)}
                          className="ml-2"
                        >
                          Reassign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(booking.scheduled_date.replace('-', ':')).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">{booking.scheduled_time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => handleUpdateStatus(booking.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <Badge variant={getStatusColor(booking.status)} className="border-none">
                            {booking.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${booking.final_price}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPrice(booking)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Unpaid
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
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

      {/* Booking Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookingDetails
              booking={selectedBooking}
              booking_sub_services={booking_sub_services}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Worker Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Worker</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <WorkerAssignForm
              booking={selectedBooking}
              onAssign={(workerName) => handleWorkerAssignment(selectedBooking.id, workerName)}
              onCancel={() => setIsAssignDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={isPriceEditDialogOpen} onOpenChange={setIsPriceEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Booking Price</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <PriceEditForm
              booking={selectedBooking}
              onUpdate={(newAmount, reason) => handlePriceUpdate(selectedBooking.id, newAmount, reason)}
              onCancel={() => setIsPriceEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


// book details
// book details
function BookingDetails({
  booking,
  booking_sub_services,
}: {
  booking: any;
  booking_sub_services: any[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Booking ID</Label>
          <p className="text-sm">{booking.id}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-1">
            <Badge variant={booking.status === "completed" ? "default" : "secondary"}>
              {booking.status}
            </Badge>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Customer</Label>
          <p className="text-sm">{booking.customer_name}</p>
          <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Worker</Label>
          <p className="text-sm">{booking.worker_name || "Not assigned"}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Service</Label>
          <p className="text-sm">{booking.service_name}</p>
          {/* ✅ Sub-services display */}
          {booking_sub_services?.length > 0 && (
            <div className="mt-2 space-y-1">
              {booking_sub_services.map((sub, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  {sub.sub_service}
                  {sub.price && (
                    <span className="ml-1 font-medium text-foreground">
                      (${sub.price})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Amount</Label>
          <p className="text-sm font-medium">${booking.final_price}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Scheduled Date</Label>
          <p className="text-sm">
            {new Date(booking.scheduled_date.replace("-", ":")).toLocaleDateString()}
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium">Scheduled Time</Label>
          <p className="text-sm">{booking.scheduled_time}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Address</Label>
        <div className="flex items-start gap-2 mt-1">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-sm">{booking.address}</p>
        </div>
      </div>

      {booking.notes && (
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <p className="text-sm text-muted-foreground">{booking.notes}</p>
        </div>
      )}
    </div>
  );
}

interface WorkerAssignFormProps {
  booking: any;
  onAssign: (workerId: string) => void;
  onCancel: () => void;
}

function WorkerAssignForm({ booking, onAssign, onCancel }: WorkerAssignFormProps) {
  const [selectedWorker, setSelectedWorker] = useState("");
  const { workers } = useWorkers();

  // ✅ Filter workers who offer the same service as the booking
  const filteredWorkers = workers.filter(
    (worker) =>
      worker.servicename?.toLowerCase().trim() ===
      booking.service_name?.toLowerCase().trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorker) {
      onAssign(selectedWorker);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Booking: {booking.booking_number}</Label>
        <p className="text-sm text-muted-foreground">{booking.service_name}</p>
        <p className="text-xs text-muted-foreground">Category: {booking.category}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="worker">Select Worker (filtered by service)</Label>
        <Select
          value={selectedWorker}
          onValueChange={(val) => setSelectedWorker(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a worker" />
          </SelectTrigger>
          <SelectContent>
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <SelectItem
                  key={worker.staff_id}
                  value={String(worker.staff_id)} // ensure it's string
                >
                  {worker.name} — {worker.servicename}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No workers available for "{booking.service_name}"
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-primary text-white"
          disabled={!selectedWorker || filteredWorkers.length === 0}
        >
          Assign Worker
        </Button>
      </div>
    </form>
  );
}

interface PriceEditFormProps {
  booking: any;
  onUpdate: (newAmount: number, reason: string) => void; // include reason
  onCancel: () => void;
}

function PriceEditForm({ booking, onUpdate, onCancel }: PriceEditFormProps) {
  const [newAmount, setNewAmount] = useState(booking.final_price);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount > 0) {
      onUpdate(newAmount, reason);
    }
  };

  const discount = booking.final_price - newAmount;
  const discountPercentage = Math.round((discount / booking.final_price) * 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Booking: {booking.id}</Label>
        <p className="text-sm text-muted-foreground">{booking.service_name}</p>
        <p className="text-sm text-muted-foreground">Customer: {booking.customer_name}</p>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span>Original Price:</span>
          <span className="font-medium">${booking.final_price}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>New Price:</span>
          <span className="font-medium text-primary">${newAmount}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Discount:</span>
            <span className="font-medium">-${discount} ({discountPercentage}%)</span>
          </div>
        )}
        {discount < 0 && (
          <div className="flex justify-between text-sm text-warning">
            <span>Additional Charge:</span>
            <span className="font-medium">+${Math.abs(discount)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newAmount">New Amount ($)</Label>
        <Input
          id="newAmount"
          type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(Number(e.target.value))}
          min="1"
          step="0.01"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Price Change</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for price adjustment (optional)"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          Update Price
        </Button>
      </div>
    </form>
  );
}