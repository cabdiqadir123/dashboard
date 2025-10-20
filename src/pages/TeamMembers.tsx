import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, ExternalLink } from "lucide-react";
import { useTeamMembers, type TeamMember } from "@/hooks/useTeamMembers";
import { useForm } from "react-hook-form";
import { ImageUpload } from "@/components/ui/image-upload";
import { LivePreview } from "@/components/ui/live-preview";

interface TeamMemberFormData {
  id: string;
  name: string;
  role: string;
  image?: string | File | null;
  linkedin_profile?: string;
  is_active: boolean;
}

export default function TeamMembers() {
  const { teamMembers, loading, createTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<TeamMemberFormData>({
    defaultValues: {
      id: "",
      name: "",
      role: "",
      image: "",
      linkedin_profile: "",
      is_active: true,
    }
  });

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && member.is_active) ||
      (statusFilter === "inactive" && !member.is_active);

    return matchesSearch && matchesStatus;
  });

  // const handleFormSubmit = async (data: TeamMemberFormData) => {
  //   try {
  //     if (editingMember) {
  //       await updateTeamMember(editingMember.id, data);
  //     } else {
  //       await createTeamMember(data);
  //     }
  //     setIsDialogOpen(false);
  //     setEditingMember(null);
  //     reset();
  //   } catch (error) {
  //     console.error('Error saving team member:', error);
  //   }
  // };

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  const handleFormSubmit = async (data: TeamMemberFormData) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();
      formData.append("name", data.name);
      formData.append("role", data.role);
      formData.append("linkedin_profile", data.linkedin_profile);
      formData.append('is_active', String(data.is_active));
      formData.append('created_at', created_at)
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (editingMember) {
        await updateTeamMember(editingMember.id, data);
      } else {
        await createTeamMember({
          name: data.name,
          role: data.role,
          linkedin_profile: data.linkedin_profile,
          is_active: data.is_active,
          image: data.image,
          created_at: created_at
        });
      }

      setIsDialogOpen(false);
      setEditingMember(null);
      reset();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setValue('id', member.id);
    setValue('name', member.name);
    setValue('role', member.role);
    setValue('image', member.image || '');
    setValue('linkedin_profile', member.linkedin_profile || '');
    setValue('is_active', member.is_active);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      await deleteTeamMember(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Manage your skilled exterminators team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { reset(); setEditingMember(null); }} className="hover-scale">
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
              <DialogDescription>
                {editingMember ? 'Update the team member details.' : 'Add a new member to your team.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input {...register('name', { required: true })} placeholder="John Doe" />
                  </div>

                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input {...register('role', { required: true })} placeholder="Senior Exterminator" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Profile Image</Label>
                  <ImageUpload
                    value={
                      watch('id') === "" ? watch('image') :
                      `https://back-end-for-xirfadsan.onrender.com/api/member/image/${watch('id')}`
                    }
                    onChange={(url) => setValue('image', url)}
                    bucket="service-images"
                    placeholder="Upload person image"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin_profile">LinkedIn Profile URL</Label>
                    <Input {...register('linkedin_profile')} placeholder="https://linkedin.com/in/johndoe" />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      checked={watch('is_active')}
                      onCheckedChange={(checked) => setValue('is_active', checked)}
                    />
                    <Label>Active Team Member</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary text-white">
                  {editingMember ? 'Update Member' : 'Add Member'}
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
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team of skilled exterminators and their profiles
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
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
                <SelectItem value="all">All Members</SelectItem>
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
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://back-end-for-xirfadsan.onrender.com/api/member/image/${member.id}`} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      {member.linkedin_profile ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={member.linkedin_profile} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* <LivePreview
                          type="testimonial"
                          data={{ ...member, image: typeof member.image === "string" ? member.image : "" }}
                        /> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(member)}
                          className="hover-scale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.id)}
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