import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Tag, Percent, Calendar, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePromoCodes } from "@/hooks/usePromoCodes";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCategories } from "@/hooks/useCategories";

// Fix build errors by adding missing interfaces

interface PromoCode {
  id: string;
  code: string;
  type: 'Percantage' | 'Fixed_Amount';
  value: number;
  title?: string;
  description?: string;
  minimum_order?: number;
  usage_limit?: number;
  used_count?: number;
  expires_at: string;
  status: 'Active' | 'expired' | 'Disabled';
  image: File | string | null;
  category_id: number;
  color:string,
}

export default function Promos() {
  const { categories } = useCategories();
  const { promoCodes, loading, error, createPromoCode, updatePromoCode, deletePromoCode } = usePromoCodes();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.title && promo.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || promo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEditPromo = (promo: PromoCode) => {
    setSelectedPromo(promo);
    setIsEditDialogOpen(true);
  };

  const handleAddPromo = () => {
    setSelectedPromo(null);
    setIsAddDialogOpen(true);
  };

  const handleSavePromo = async (promoData: any) => {
    let result;
    if (selectedPromo) {
      // Edit existing promo
      result = await updatePromoCode(selectedPromo.id, promoData);
      if (result.success) {
        toast({
          title: "Promo Code Updated",
          description: "Promo code has been updated successfully.",
        });
      }
    } else {
      // Add new promo
      result = await createPromoCode(promoData);
      if (result.success) {
        toast({
          title: "Promo Code Created",
          description: "New promo code has been created successfully.",
        });
      }
    }

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to save promo code",
        variant: "destructive",
      });
    } else {
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setSelectedPromo(null);
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    const result = await deletePromoCode(promoId);
    if (result.success) {
      toast({
        title: "Promo Code Deleted",
        description: "Promo code has been deleted successfully.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete promo code",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: `Promo code "${code}" has been copied to clipboard.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'disabled': return 'secondary';
      default: return 'default';
    }
  };

  const activePromos = promoCodes.filter(p => p.status === 'Active').length;
  const totalUsage = promoCodes.reduce((acc, p) => acc + (p.used_count || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading promo codes...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promo Codes Management</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes</p>
        </div>
        <Button
          className="bg-gradient-primary text-white hover:opacity-90"
          onClick={handleAddPromo}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Promos</p>
                <p className="text-2xl font-bold text-foreground">{promoCodes.length}</p>
              </div>
              <Tag className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Promos</p>
                <p className="text-2xl font-bold text-success">{activePromos}</p>
              </div>
              <Tag className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold text-foreground">{totalUsage}</p>
              </div>
              <Percent className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Usage</p>
                <p className="text-2xl font-bold text-foreground">
                  {promoCodes.length > 0 ? Math.round(totalUsage / promoCodes.length) : 0}
                </p>
              </div>
              <Percent className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Promo Codes Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search promo codes..."
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
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type & Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-bold bg-muted px-2 py-1 rounded">
                          {promo.code}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(promo.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {promo.type === 'Percantage' ? (
                          <Percent className="h-4 w-4 text-success" />
                        ) : (
                          <span className="text-success font-bold">$</span>
                        )}
                        <span className="font-medium">
                          {promo.type === 'Percantage' ? `${promo.value}%` : `$${promo.value}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {promo.used_count || 0} / {promo.usage_limit || '∞'}
                        </div>
                        {promo.usage_limit && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{
                                width: `${Math.min(((promo.used_count || 0) / promo.usage_limit) * 100, 100)}%`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(promo.expires_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(promo.status)}>
                        {promo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm">
                        { promo.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPromo(promo as any)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePromo(promo.id)}
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

      {/* Edit Promo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
          </DialogHeader>
          {selectedPromo && (
            <PromoForm
              promo={selectedPromo}
              onSave={handleSavePromo}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Promo Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Promo Code</DialogTitle>
          </DialogHeader>
          <PromoForm
            onSave={handleSavePromo}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PromoFormProps {
  promo?: PromoCode;
  onSave: (promo: Omit<PromoCode, 'id' | 'createdAt' | 'usedCount'>) => void;
  onCancel: () => void;
}

// Fix build errors in PromoForm by updating field names

function PromoForm({ promo, onSave, onCancel }: PromoFormProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    id: promo?.id || '',
    code: promo?.code || "",
    type: promo?.type || 'Percantage' as 'Percantage' | 'Fixed_Amount',
    value: promo?.value || 0,
    title: promo?.title || "",
    description: promo?.description || "",
    minimum_order: promo?.minimum_order || 0,
    usage_limit: promo?.usage_limit || 0,
    expires_at: promo?.expires_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: promo?.status || 'Active' as 'Active' | 'expired' | 'Disabled',
    image: promo?.image || "",
    category_id: promo?.category_id || "",
    color: promo?.color || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      minimum_order: formData.minimum_order || null,
      usage_limit: formData.usage_limit || null,
      expires_at: new Date(formData.expires_at).toISOString(),
      starts_at: new Date().toISOString(),
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Promo Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="PROMO20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Discount Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'Percantage' | 'Fixed_Amount') =>
              setFormData({ ...formData, type: value })
            }
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter promo title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Color</Label>
          <Input
            id="title"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="Enter promo title"
            type="color"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image">Primary Image</Label>
          <ImageUpload
            value={formData.id === "" ? formData.image : `https://back-end-for-xirfadsan.onrender.com/api/discount/image/${formData.id}`}
            onChange={(url) => setFormData({ ...formData, image: url })}
            bucket="category-images"
            placeholder="Upload category image"
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">
            {formData.type === 'Percantage' ? 'Percantage (%)' : 'Amount ($)'}
          </Label>
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'Active' | 'expired' | 'Disabled') =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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
          placeholder="Description of the promo code"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimum_order">Min Order ($)</Label>
          <Input
            id="minimum_order"
            type="number"
            value={formData.minimum_order}
            onChange={(e) => setFormData({ ...formData, minimum_order: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage_limit">Usage Limit</Label>
          <Input
            id="usage_limit"
            type="number"
            value={formData.usage_limit}
            onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expires_at">Expiry Date</Label>
        <Input
          id="expires_at"
          type="date"
          value={formData.expires_at}
          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white">
          {promo ? 'Update' : 'Create'} Promo Code
        </Button>
      </div>
    </form>
  );
}