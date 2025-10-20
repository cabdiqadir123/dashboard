import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useComplaints } from "@/hooks/useComplaints";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Complaints() {
  const { complaints, loading, error, updateComplaintStatus } = useComplaints();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsDetailDialogOpen(true);
  };

  const handleUpdateComplaint = async (complaintId: string, status: string, notes: string) => {
    const result = await updateComplaintStatus(complaintId, status, notes);
    if (result.success) {
      toast({
        title: "Complaint Updated",
        description: `Complaint has been marked as ${status}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update complaint",
        variant: "destructive",
      });
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const statusCounts = {
    pending: complaints.filter(c => c.status === 'Pending').length,
    review: complaints.filter(c => c.status === 'Review').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading complaints...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Complaints Management</h1>
          <p className="text-muted-foreground">Monitor and resolve customer complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold text-foreground">{complaints.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-destructive">{statusCounts.pending}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{statusCounts.review}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{statusCounts.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Complaints Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>
                      <div className="font-medium">{complaint.complaint_number}</div>
                      <div className="text-xs text-muted-foreground">{complaint.booking_id || 'No booking'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm">
                          C
                        </div>
                        <div className="font-medium">{complaint.customer_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate font-medium">
                        {complaint.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(complaint)}
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

      {/* Complaint Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <ComplaintDetails
              complaint={selectedComplaint}
              onSave={(status, notes) => {
                handleUpdateComplaint(selectedComplaint.id, status, notes);
                setIsDetailDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ComplaintDetailsProps {
  complaint: any;
  onSave: (status: string, notes: string) => void;
}

function ComplaintDetails({ complaint, onSave }: ComplaintDetailsProps) {
  const [notes, setNotes] = useState(complaint.resolution_notes || "");
  const [status, setStatus] = useState(complaint.status);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Complaint ID</Label>
          <p className="text-sm">{complaint.complaint_number}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Booking ID</Label>
          <p className="text-sm">{complaint.booking_id || "No booking"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Customer</Label>
          <p className="text-sm">{complaint.customer_name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <Badge
            variant={complaint.priority === "high" ? "destructive" : "outline"}
          >
            {complaint.priority}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Customer</Label>
          <p className="text-sm">{complaint.resolution_notes}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Subject</Label>
          <p className="text-sm font-medium">{complaint.subject}</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Description</Label>
          <p className="text-sm text-muted-foreground">{complaint.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Admin Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add resolution notes..."
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onSave(status, notes)}
          className="bg-gradient-primary text-white"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}