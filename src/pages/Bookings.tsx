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
import { Search, Calendar, DollarSign, Clock, MapPin, User, Settings, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/useBookings";
import { useWorkers } from "@/hooks/useWorkers";
import axios from "axios";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCategories } from "@/hooks/useCategories";
import AvailableTimeSelect from "@/hooks/AvailableTimePickerProps ";
import { Value } from "@radix-ui/react-select";

type BookingCreatePayload = {
  book_id: number;

  customer_id: number;
  service_id: number;
  address: string;
  // sub_service_id: number;
  staff_id: number;

  booking_status: string;

  price_amount: number;
  amount: number;
  per: number;
  per_type: string;

  Avialable_time: string;
  discription: string;
  startdate: string;
  created_at?: string;
};


interface Bookings {
  id: number;
  book_id: number;
  customer_id: number;
  service_id: number;
  sub_service_id: number;
  booking_status: string;
  price_amount: number;
  amount: number;
  per: number;
  per_type: string;
  staff_id: number;
  Avialable_time: string;
  discription: string;
  startdate: string;
  created_at: string;
  city: string;
  state: string;
  district: string;
}

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);


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


  const createBooking = async (bookingData: BookingCreatePayload) => {
    try {
      const res = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/booking/addNew",
        bookingData,
        { headers: { "Content-Type": "application/json" } }
      );


      return { success: true, data: res.data };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend response error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error:", err);
      }
      return { success: false, error: "Failed to create booking", err };
    }
  };


  const handleSaveBooking = async (
    bookingData: BookingCreatePayload,
    subServices: { sub_service_id: number; item: string }[]
  ) => {
    // 1️⃣ Create the main booking
    const bookingResult = await createBooking(bookingData);

    if (bookingResult.success) {
      const book_id = bookingResult.data.book_id; // backend should return this

      try {
        // 2️⃣ Insert sub-services for this booking
        for (const sub of subServices) {
          await axios.post(
            "https://back-end-for-xirfadsan.onrender.com/api/booking/add_booking_subservices",
            {
              book_id,
              sub_service_id: sub.sub_service_id,
              item: sub.item,
            },
            { headers: { "Content-Type": "application/json" } }
          );
        }

        toast({
          title: "Booking Created",
          description: "Booking and sub-services added successfully.",
        });
        setIsAddDialogOpen(false); // close dialog
      } catch (err) {
        console.error("❌ Error adding sub-services:", err);
        toast({
          title: "Partial Success",
          description: "Booking created but failed to add some sub-services.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: bookingResult.error,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground">Monitor and manage service bookings</p>
        </div>
        <Button
          className="bg-gradient-primary text-white hover:opacity-90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
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

      {/* Add Worker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
          </DialogHeader>
          <WorkerAddForm
            onSave={async (bookingData, subServices) => {
              await handleSaveBooking(bookingData, subServices);
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

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


interface BookingAddFormProps {
  onSave: (
    booking: BookingCreatePayload,
    subServices: { sub_service_id: number; item: string }[]
  ) => void;
  onCancel: () => void;
}


// insert form

function WorkerAddForm({ onSave, onCancel }: BookingAddFormProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    book_id: 1234,

    customer_id: 0,
    service_id: 0,
    sub_service_id: 0,
    staff_id: 0,

    booking_status: 'Pending',

    price_amount: 0,
    amount: 0,
    per: 0,
    per_type: 'Percantage',

    Avialable_time: '',
    discription: '',
    startdate: '',

    city: '',
    state: '',
    district: ''
  });

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  const formatStartDate = (dateStr: string) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }) + " 00-00";
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created_at = getSomaliaTime();

    const payload: BookingCreatePayload = {
      book_id: formData.book_id,
      customer_id: formData.customer_id,
      service_id: formData.service_id,
      staff_id: formData.staff_id,

      booking_status: formData.booking_status || 'Pending',

      price_amount: formData.amount, // ✅ FIX
      amount: formData.amount,
      per: formData.per,
      per_type: formData.per_type || 'Fixed_Amount',

      Avialable_time: formData.Avialable_time,
      discription: formData.discription,
      startdate: formatStartDate(formData.startdate),

      address: `${formData.district},${formData.state},${formData.city}`,
      created_at: created_at
    };

    const subServices = formData.sub_service_id
      ? [{ sub_service_id: formData.sub_service_id, item: "1" }]
      : [];



    console.log("🚀 Sending payload:", payload); // 👈 DEBUG

    onSave(payload, subServices);
  };


  const [city, setcity] = useState([]);
  const fetch_city = async () => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/address/city");
    const resltdata = rptdata.data;
    setcity(resltdata);
  };

  const [district, setdistrict] = useState([]);
  const fetch_district = async () => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/address/district");
    const resltdata = rptdata.data;
    setdistrict(resltdata);
  };

  const [states, setstates] = useState([]);
  const fetch_state = async () => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/address/state");
    const resltdata = rptdata.data;
    setstates(resltdata);
  };

  const [userdata, setuserdata] = useState([]);
  const fetch_userdata_data = async (id) => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/user/userrole/all/" + id);
    const resltdata = rptdata.data;
    setuserdata(resltdata);
  };

  const [workerdata, setworkerdata] = useState([]);
  const fetch_worker_data = async (id) => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/staff/all_admin/" + id);
    const resltdata = rptdata.data;
    setworkerdata(resltdata);
  };

  const [subservicesdata, setsubservicesdata] = useState([]);
  const fetch_subservices_data = async (id) => {
    const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/subservices/allNew/" + id);
    const resltdata = rptdata.data;
    setsubservicesdata(resltdata);
  };

  useEffect(() => {
    fetch_city();
    fetch_state();
    fetch_district();
    fetch_userdata_data("Customer");
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Customer</Label>
          <Select value={formData.customer_id.toString()} onValueChange={(value) => setFormData({ ...formData, customer_id: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {userdata.map(user => (
                <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.service_id.toString()} onValueChange={(value) => {
            if (!value) return; // 🚫 STOP empty calls
            setFormData({ ...formData, service_id: parseInt(value) });
            fetch_worker_data(value);
            fetch_subservices_data(value);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Sub services</Label>
          <Select
            value={formData.sub_service_id?.toString()}
            onValueChange={(value) => {
              const selectedSubService = subservicesdata.find(
                (s) => s.sub_service_id === Number(value)
              );

              if (!selectedSubService) return;

              setFormData((prev) => ({
                ...prev,
                sub_service_id: selectedSubService.sub_service_id,
                amount: selectedSubService.price,      // ✅ set price here
                price_amount: selectedSubService.price // optional if you use both
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {subservicesdata.map(subservices => (
                <SelectItem key={subservices.sub_service_id} value={subservices.sub_service_id.toString()}>{subservices.sub_service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Discription</Label>
          <Input
            id="location"
            value={formData.discription}
            onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Worker</Label>
          <Select value={formData.staff_id.toString()} onValueChange={(value) => {
            setFormData({ ...formData, staff_id: parseInt(value) });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {workerdata.map(worker => (
                <SelectItem key={worker.staff_id} value={worker.staff_id.toString()}>{worker.staff_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Status</Label>
          <Select
            value={formData.booking_status}
            onValueChange={(value: 'Pending' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') =>
              setFormData({ ...formData, booking_status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">City</Label>
          <Select value={formData.city.toString()} onValueChange={(value) => setFormData({ ...formData, city: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {city.map(city => (
                <SelectItem key={city.id} value={city.name.toString()}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">State</Label>
          <Select value={formData.state.toString()} onValueChange={(value) => setFormData({ ...formData, state: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {states.map(state => (
                <SelectItem key={state.id} value={state.name.toString()}>{state.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">district</Label>
          <Select value={formData.district.toString()} onValueChange={(value) => setFormData({ ...formData, district: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {district.map(district => (
                <SelectItem key={district.id} value={district.name.toString()}>{district.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <AvailableTimeSelect
            value={formData.Avialable_time}
            onChange={(time) => setFormData({ ...formData, Avialable_time: time })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Orginal price</Label>
          <Input
            id="location"
            value={formData.price_amount}
            onChange={(e) => setFormData({ ...formData, price_amount: parseInt(e.target.value) })}
            required
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Total</Label>
          <Input
            id="location"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
            required
            disabled
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Per</Label>
          <Input
            id="per"
            type="number"
            value={formData.per}
            onChange={(e) => {
              const perValue = Number(e.target.value) || 0;

              setFormData((prev) => {
                if (prev.per_type === "Fixed_Amount") {
                  const totalPrice = prev.price_amount - perValue;
                  return {
                    ...prev,
                    per: perValue,          // ✅ now updates correctly
                    amount: totalPrice      // ✅ recalculated
                  };
                } else {
                  const discount = (perValue / 100) * prev.price_amount;
                  const totalPrice = prev.price_amount - discount;
                  return {
                    ...prev,
                    per: perValue,          // ✅ now updates correctly
                    amount: totalPrice      // ✅ recalculated
                  };
                }
              });
            }}
            required
          />

        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Type</Label>
          <Select
            value={formData.per_type}
            onValueChange={(value: "Percentage" | "Fixed_Amount") => {
              setFormData((prev) => {
                let totalPrice = prev.price_amount;

                if (value === "Fixed_Amount") {
                  // per = fixed discount amount
                  totalPrice = Math.max(0, prev.price_amount - prev.per);
                } else {
                  // per = percentage
                  const discount = (prev.per / 100) * prev.price_amount;
                  totalPrice = prev.price_amount - discount;
                }

                return {
                  ...prev,
                  per_type: value,
                  amount: totalPrice,
                };
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Percantage">Percentage</SelectItem>
              <SelectItem value="Fixed_Amount">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Start date</Label>
        <Input
          type="date"
          value={formData.startdate}
          onChange={(e) =>
            setFormData({ ...formData, startdate: e.target.value })
          }
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          Create Booking
        </Button>
      </div>
    </form>
  );
}