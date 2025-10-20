import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Settings, DollarSign, Clock, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubServices } from "@/hooks/useSubServices";
import { useCategories } from "@/hooks/useCategories";
import { ImageUpload } from "@/components/ui/image-upload";

export default function SubServices() {
  const { subServices, loading, error, createSubService, updateSubService, deleteSubService, toggleStatus } = useSubServices();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubService, setSelectedSubService] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredSubServices = subServices.filter(subService => {
    const matchesSearch = subService.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subService.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || subService.category_name === categoryFilter;
    const matchesStatus = statusFilter === "all" || subService.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateSubService = async (subServiceData: any) => {
    const result = await createSubService({
      name: subServiceData.name,
      description: subServiceData.description,
      category_id: subServiceData.category_id,
      price: subServiceData.price,
      duration_minutes: subServiceData.duration_minutes,
      image: subServiceData.image,
      status: 'Active'
    });

    if (result.success) {
      setIsCreateDialogOpen(false);
      toast({
        title: "Sub-Service Created",
        description: "New sub-service has been created successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create sub-service",
        variant: "destructive",
      });
    }
  };

  const handleEditSubService = async (subServiceData: any) => {
    if (!selectedSubService) return;

    const result = await updateSubService(selectedSubService.id, {
      name: subServiceData.name,
      description: subServiceData.description,
      category_id: subServiceData.category_id,
      price: subServiceData.price,
      duration_minutes: subServiceData.duration_minutes,
      image: subServiceData.image,
      status: subServiceData.status
    });

    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedSubService(null);
      toast({
        title: "Sub-Service Updated",
        description: "Sub-service has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update sub-service",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubService = async (id: string) => {
    const result = await deleteSubService(id);
    if (result.success) {
      toast({
        title: "Sub-Service Deleted",
        description: "Sub-service has been deleted successfully.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete sub-service",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const result = await toggleStatus(id);
    if (result.success) {
      toast({
        title: "Status Updated",
        description: "Sub-service status has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const activeSubServices = subServices.filter(s => s.status === 'Active').length;
  const avgPrice = subServices.length > 0 ? subServices.reduce((acc, s) => acc + s.price, 0) / subServices.length : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading sub-services...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sub-Services Management</h1>
          <p className="text-muted-foreground">Manage individual services and their pricing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Sub-Service</DialogTitle>
            </DialogHeader>
            <SubServiceForm onSubmit={handleCreateSubService} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sub-Services</p>
                <p className="text-2xl font-bold text-foreground">{subServices.length}</p>
              </div>
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold text-success">{activeSubServices}</p>
              </div>
              <Settings className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                <p className="text-2xl font-bold text-foreground">${avgPrice.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              </div>
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Sub-Services Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search sub-services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Times Booked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubServices.map((subService) => (
                  <TableRow key={subService.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {subService.image && (
                          <img
                            src={`https://back-end-for-xirfadsan.onrender.com/api/subservices/image/${subService.id}`}
                            alt={subService.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{subService.name}</div>
                          <div className="text-sm text-muted-foreground">{subService.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subService.category_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{subService.price}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {subService.booking_count} bookings
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(subService.status)}>
                          {subService.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(subService.id)}
                        >
                          Toggle
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubService(subService);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubService(subService.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Sub-Service</DialogTitle>
          </DialogHeader>
          {selectedSubService && (
            <SubServiceForm
              initialData={selectedSubService}
              onSubmit={handleEditSubService}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedSubService(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Fix build errors by adding missing interface

interface SubService {
  id: string;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  price: number;
  duration_minutes: number;
  image: string | File | null;
  status: 'active' | 'inactive';
  created_at: string;
}

interface SubServiceFormProps {
  initialData?: SubService;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function SubServiceForm({ initialData, onSubmit, onCancel }: SubServiceFormProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || 0,
    price: initialData?.price || 0,
    duration_minutes: initialData?.duration_minutes || 60,
    image: initialData?.image || null,
    status: initialData?.status || 'Active' as 'Active' | 'Inactive'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter service name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category_id.toString()} onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}>
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
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter service description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
            placeholder="60"
            min="15"
            step="15"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image">Service Image</Label>
          <ImageUpload
            value={formData.id === "" ? formData.image : `https://back-end-for-xirfadsan.onrender.com/api/subservices/image/${formData.id}`}
            onChange={(url) => setFormData({ ...formData, image: url })}
            bucket="category-images"
            placeholder="Upload category image"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          {initialData ? 'Update' : 'Create'} Sub-Service
        </Button>
      </div>
    </form>
  );
}