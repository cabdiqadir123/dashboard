import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Trash2, Eye, Search } from "lucide-react";
import { useAccountDeletionRequests, type AccountDeletionRequest } from "@/hooks/useAccountDeletionRequests";
import { useState } from "react";

export default function AccountDeletions() {
  const { deletionRequests, loading, processRequest, deleteRequest } = useAccountDeletionRequests();
  const [selectedRequest, setSelectedRequest] = useState<AccountDeletionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleView = (request: AccountDeletionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (confirm('Are you sure you want to approve this deletion request?')) {
      await processRequest(id, 'approved');
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this deletion request?')) {
      await processRequest(id, 'rejected');
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredRequests = deletionRequests.filter(request => {
    const matchesSearch = request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Deletion Requests</h1>
          <p className="text-muted-foreground">Review and manage user account deletion requests</p>
        </div>
      </div>

      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle>Deletion Requests</CardTitle>
          <CardDescription>
            Review account deletion requests and process them accordingly
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.user_email}</p>
                        {request.user_id != null && (
                          <p className="text-sm text-muted-foreground">
                            ID: {String(request.user_id).slice(0, 8)}...
                          </p>
                        )}

                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason || 'No reason provided'}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(request)} className="hover-scale">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-700 hover-scale"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-700 hover-scale"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRequest(request.id)}
                          className="hover-scale text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Account Deletion Request</DialogTitle>
            <DialogDescription>Review the details of this deletion request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{selectedRequest.user_email}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant={getBadgeVariant(selectedRequest.status)} className="ml-2">
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="font-medium">Confirmation Text:</span>
                <p className="text-sm border rounded p-2 bg-muted/30 mt-1">
                  "{selectedRequest.confirmation_text}"
                </p>
              </div>

              {selectedRequest.reason && (
                <div>
                  <span className="font-medium">Reason:</span>
                  <p className="text-sm border rounded p-2 bg-muted/30 mt-1">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Requested on: {new Date(selectedRequest.created_at).toLocaleString()}</p>
                {selectedRequest.processed_at && (
                  <p>Processed on: {new Date(selectedRequest.processed_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}