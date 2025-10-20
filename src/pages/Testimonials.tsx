import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useTestimonials, type Testimonial } from "@/hooks/useTestimonials";
import { useForm } from "react-hook-form";
import { ImageUpload } from "@/components/ui/image-upload";
import { LivePreview } from "@/components/ui/live-preview";

interface TestimonialFormData {
  id: string;
  title: string;
  description: string;
  person_image?: string | File | null;
  person_name: string;
  person_role: string;
  is_active: boolean;
}

export default function Testimonials() {
  const { testimonials, loading, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<TestimonialFormData>({
    defaultValues: {
      id: '',
      title: "",
      description: "",
      person_image: "",
      person_name: "",
      person_role: "",
      is_active: true,
    }
  });

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.person_role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && testimonial.is_active) ||
      (statusFilter === "inactive" && !testimonial.is_active);

    return matchesSearch && matchesStatus;
  });

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  const handleFormSubmit = async (data: TestimonialFormData) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();
      formData.append("name", data.person_name);
      formData.append("person_role", data.person_role);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append('is_active', String(data.is_active));
      formData.append('created_at', created_at)
      if (data.person_image instanceof File) {
        formData.append("image", data.person_image);
      }

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
      } else {
        await createTestimonial({
          person_name: data.person_name,
          description: data.description,
          person_image: data.person_image,
          title: data.title,
          is_active: data.is_active,
          person_role: data.person_role,
          created_at: created_at
        });
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      reset();
    } catch (error) {
      console.error("Error saving testimonial:", error);
    }
  };


  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setValue('id', testimonial.id);
    setValue('title', testimonial.title);
    setValue('description', testimonial.description);
    setValue('person_image', testimonial.person_image || '');
    setValue('person_name', testimonial.person_name);
    setValue('person_role', testimonial.person_role);
    setValue('is_active', testimonial.is_active);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      await deleteTestimonial(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { reset(); setEditingTestimonial(null); }} className="hover-scale">
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}</DialogTitle>
              <DialogDescription>
                {editingTestimonial ? 'Update the testimonial details.' : 'Add a new customer testimonial.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input {...register('title', { required: true })} placeholder="Testimonial title" />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      checked={watch('is_active')}
                      onCheckedChange={(checked) => setValue('is_active', checked)}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    {...register('description', { required: true })}
                    placeholder="What they said about us..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="person_name">Person Name *</Label>
                    <Input {...register('person_name', { required: true })} placeholder="John Doe" />
                  </div>

                  <div>
                    <Label htmlFor="person_role">Person Role *</Label>
                    <Input {...register('person_role', { required: true })} placeholder="CEO at Company" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="person_image">Person Image</Label>
                  <ImageUpload
                    value={
                      watch('id') === "" ? watch('person_image') :
                      `https://back-end-for-xirfadsan.onrender.com/api/testimonial/image/${watch('id')}`
                    }
                    onChange={(url) => setValue('person_image', url)}
                    bucket="service-images"
                    placeholder="Upload person image"
                  />

                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="animate-scale-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>
                Manage customer testimonials and reviews for your website
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
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
                <SelectItem value="all">All Testimonials</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={'testimonial.person_image'} alt={testimonial.person_name} />
                          <AvatarFallback>
                            {testimonial.person_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.person_name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.person_role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{testimonial.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{testimonial.description}</TableCell>
                    <TableCell>
                      <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                        {testimonial.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <LivePreview
                          type="testimonial"
                          data={{ ...testimonial, person_image: typeof testimonial.person_image === "string" ? testimonial.person_image : "" }}
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(testimonial)}
                          className="hover-scale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(testimonial.id)}
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
    </div>
  );
}