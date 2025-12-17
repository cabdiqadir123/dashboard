import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, User as UserIcon, Phone, Mail, Calendar, Eye, EyeOff } from "lucide-react";
import { useInterns, type Intern } from "@/hooks/useIntern";
import { useForm } from "react-hook-form";
import { ImageUpload } from "@/components/ui/image-upload";

interface InternFormData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  sex?: 'Male' | 'Female';
  status?: 'Active' | 'Unactive';
  profile_image?: string | File | null;
}

export default function Interns() {
  const { interns, loading, createIntern, updateIntern, deleteIntern } = useInterns();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<InternFormData>({
    defaultValues: {
      id: "",
      name: "",
      email: "",
      phone: "",
      address:"",
      role: "",
      sex: "Male",
      status: "Active",
      profile_image: null,
    }
  });

  /* =========================
     FILTER
  ========================= */
  const filteredInterns = interns.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =========================
     SUBMIT
  ========================= */
  const handleFormSubmit = async (data: InternFormData) => {
    try {
      if (editingIntern) {
        await updateIntern(editingIntern.id, data);
      } else {
        await createIntern(data);
      }

      setIsDialogOpen(false);
      setEditingIntern(null);
      reset();
    } catch (err) {
      console.error("Error saving intern:", err);
    }
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (intern: Intern) => {
    setEditingIntern(intern);
    setValue('id', intern.id);
    setValue('name', intern.name);
    setValue('email', intern.email);
    setValue('phone', intern.phone || '');
    setValue('address', intern.address);
    setValue('role', intern.role || '');
    setValue('sex', intern.sex || 'Male');
    setValue('status', intern.status);
    setValue('profile_image', null);
    setIsDialogOpen(true);
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this intern?")) {
      await deleteIntern(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interns</h1>
          <p className="text-muted-foreground">Manage your intern team</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { reset(); setEditingIntern(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Intern
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingIntern ? "Edit Intern" : "Add Intern"}
              </DialogTitle>
              <DialogDescription>
                Manage intern profile information
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input {...register("name", { required: true })} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input {...register("email", { required: true })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input {...register("address")} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input {...register("role")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sex</Label>
                  <Select
                    value={watch("sex")}
                    onValueChange={(v) => setValue("sex", v as any)}
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

                <div>
                  <Label>Status</Label>
                  {/* <Input {...register("status")} /> */}
                  <Select
                    value={watch("status")}
                    onValueChange={(v) => setValue("status", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Unactive">Unactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Profile Image</Label>
                <ImageUpload
                  value={watch("profile_image")}
                  onChange={(file) => setValue("profile_image", file)}
                  bucket="service-images"
                  placeholder="Upload intern image"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIntern ? "Update Intern" : "Add Intern"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Intern List</CardTitle>
          <CardDescription>All registered interns</CardDescription>

          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Info</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredInterns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {intern.profile_image ? (
                          <img
                            src={`https://back-end-for-xirfadsan.onrender.com/api/intern/image/${intern.id}`}
                            alt={intern.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                            {intern.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{intern.name}</div>
                          <div className="text-sm text-muted-foreground">{intern.address}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {intern.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {intern.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{intern.sex || "-"}</TableCell>
                    <TableCell>{intern.role || "-"}</TableCell>
                    <TableCell>
                      <Badge>{intern.status || "Active"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(intern)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(intern.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}