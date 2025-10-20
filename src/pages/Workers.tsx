import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Settings, Users, Star, MapPin, Phone, DollarSign, TrendingUp, Briefcase, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkers } from "@/hooks/useWorkers";
import { useSubServices } from "@/hooks/useSubServices";
import { useWorkerServices } from "@/hooks/useWorkerServices";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCategories } from "@/hooks/useCategories";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  total_jobs: number;
  status: 'Active' | 'Inactive';
  location: string;
  services: string[];
  total_earnings: number;
  created_at: string;
  sex: 'Female' | 'Male';
  image: File | string | null;
  category_id: number;
  available: 'true' | 'false';
  password: string;
}


export default function Workers() {
  const { workers, loading, error, updateWorker, updateWorkerStatus, createWorker, deleteWorker } = useWorkers();
  const { subServices } = useSubServices();
  const { assignServices, getWorkerServices } = useWorkerServices();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { categories } = useCategories();

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || worker.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAssignServices = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsServiceDialogOpen(true);
  };

  const handleUpdateServices = async (workerId: string, newServices: string[]) => {
    const result = await assignServices(workerId, newServices);
    if (result.success) {
      toast({
        title: "Services Updated",
        description: "Worker services have been updated successfully.",
      });
      setIsServiceDialogOpen(false);
      setSelectedWorker(null);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update worker services.",
        variant: "destructive",
      });
    }
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = async (workerId: string) => {
    const result = await deleteWorker(workerId);
    if (result.success) {
      toast({
        title: "Worker Deleted",
        description: "Worker has been deleted successfully.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete Worker",
        variant: "destructive",
      });
    }
  };

  const handleUpdateWorker = async (updatedWorker: Worker) => {
    const { success } = await updateWorker(updatedWorker.id, updatedWorker);

    if (success) {
      setIsEditDialogOpen(false);
      setSelectedWorker(null);
      toast({
        title: "Worker Updated",
        description: "Worker information has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update worker.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    const newStatus = worker.status === 'Active' ? 'Inactive' : 'Active';
    const { success } = await updateWorkerStatus(workerId, newStatus);

    if (success) {
      toast({
        title: "Status Updated",
        description: "Worker status has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update worker status.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workers Management</h1>
          <p className="text-muted-foreground">Manage service providers and their assignments</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold text-foreground">{workers.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                <p className="text-2xl font-bold text-success">{workers.filter(w => w.status === 'Active').length}</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(workers.reduce((acc, w) => acc + w.rating, 0) / workers.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold text-foreground">
                  {workers.reduce((acc, w) => acc + w.total_jobs, 0)}
                </p>
              </div>
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Workers Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search workers..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredWorkers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No workers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {worker.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">{worker.email}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {worker.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-success" />
                          <span className="font-medium text-success">${worker.total_earnings.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{worker.total_jobs}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {worker.services}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={worker.status === 'Active' ? 'default' : 'destructive'}>
                            {worker.status}
                          </Badge>
                          <Switch
                            checked={worker.status === 'Active'}
                            onCheckedChange={() => handleToggleStatus(worker.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignServices(worker)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditWorker(worker)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(worker.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Services Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Services</DialogTitle>
          </DialogHeader>z
          {selectedWorker && (
            <ServiceAssignForm
              worker={selectedWorker}
              onSave={(services) => handleUpdateServices(selectedWorker.id, services)}
              onCancel={() => setIsServiceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <WorkerEditForm
              worker={selectedWorker}
              onSave={handleUpdateWorker}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Worker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
          </DialogHeader>
          <WorkerAddForm
            onSave={async (workerData) => {
              // Add defaults for missing fields
              const completeWorkerData = {
                ...workerData,
                password: workerData.password || "defaultPassword123",
                rating: 5.0,
                total_jobs: 0,
                total_earnings: 0,
                services: []
              };
              const result = await createWorker(completeWorkerData);
              if (result.success) {
                setIsAddDialogOpen(false);
                toast({
                  title: "Worker Created",
                  description: "Worker has been created successfully.",
                });
              } else {
                toast({
                  title: "Error",
                  description: result.error || "Failed to create worker",
                  variant: "destructive",
                });
              }
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ServiceAssignFormProps {
  worker: Worker;
  onSave: (services: string[]) => void;
  onCancel: () => void;
}

function ServiceAssignForm({ worker, onSave, onCancel }: ServiceAssignFormProps) {
  const { subServices } = useSubServices();
  const { getWorkerServices } = useWorkerServices();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkerServices = async () => {
      const workerServiceIds = await getWorkerServices(worker.id);
      setSelectedServices(workerServiceIds);
      setLoading(false);
    };
    loadWorkerServices();
  }, [worker.id, getWorkerServices]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedServices);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading services...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <Label>Select Services for {worker.name}</Label>
        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
          {subServices.filter(service => service.status === 'active').map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={service.id}
                checked={selectedServices.includes(service.id)}
                onCheckedChange={() => handleServiceToggle(service.id)}
              />
              <Label htmlFor={service.id} className="text-sm font-normal">
                {service.name} - {service.category_name} (${service.price})
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          Save Services
        </Button>
      </div>
    </form>
  );
}

interface WorkerEditFormProps {
  worker: Worker;
  onSave: (worker: Worker) => void;
  onCancel: () => void;
}

// update form

function WorkerEditForm({ worker, onSave, onCancel }: WorkerEditFormProps) {
  const [formData, setFormData] = useState<Worker & { password?: string }>({
    ...worker,
  });

  const { categories } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Sex</Label>
          <Select
            value={formData.sex}
            onValueChange={(value: 'Male' | 'Female' | 'Male') =>
              setFormData({ ...formData, sex: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'Active' | 'Inactive' | 'Active') =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter default password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id !== null && formData.category_id !== undefined ? formData.category_id.toString() : ""}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value ? parseInt(value) : null })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image">Primary Image</Label>
          <ImageUpload
            value={formData.id === "" ? formData.image : `https://back-end-for-xirfadsan.onrender.com/api/user/image/${formData.id}`}
            onChange={(url) => setFormData({ ...formData, image: url })}
            bucket="category-images"
            placeholder="Upload category image"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Available</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'true' | 'true' | 'false') =>
              setFormData({ ...formData, available: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">true</SelectItem>
              <SelectItem value="false">false</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="total_earnings">Total Earnings ($)</Label>
        <Input
          id="total_earnings"
          type="number"
          value={formData.total_earnings}
          onChange={(e) => setFormData({ ...formData, total_earnings: parseFloat(e.target.value) })}
          disabled
        />
        <p className="text-xs text-muted-foreground">Total earnings are calculated automatically</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

interface WorkerAddFormProps {
  onSave: (worker: Pick<Worker, 'name' | 'email' | 'phone' | 'location' | 'status' | 'sex' | 'image' | 'category_id' | 'available'> & { password?: string }) => void;
  onCancel: () => void;
}

// insert form

function WorkerAddForm({ onSave, onCancel }: WorkerAddFormProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'Active' as 'Active' | 'Inactive',
    password: '',
    sex: 'Male' as 'Male' | 'Female',
    image: null,
    category_id: 0,
    available: 'true' as | 'true' | 'false'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Sex</Label>
          <Select
            value={formData.sex}
            onValueChange={(value: 'Male' | 'Female' | 'Male') =>
              setFormData({ ...formData, sex: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'Active' | 'Inactive' | 'Active') =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter default password"
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
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image">Primary Image</Label>
          <ImageUpload
            value={formData.image || null}
            onChange={(url) => setFormData({ ...formData, image: url })}
            bucket="category-images"
            placeholder="Upload category image"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Available</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'true' | 'true' | 'false') =>
              setFormData({ ...formData, available: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">true</SelectItem>
              <SelectItem value="false">false</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          Create Worker
        </Button>
      </div>
    </form>
  );
}