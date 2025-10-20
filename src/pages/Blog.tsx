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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { useBlogPosts, type BlogPost } from "@/hooks/useBlogPosts";
import { useForm } from "react-hook-form";
import { ImageUpload } from "@/components/ui/image-upload";
import { LivePreview } from "@/components/ui/live-preview";

interface BlogPostFormData {
  id: string;
  title: string;
  short_description: string;
  cover_image?: string | File | null;
  content?: string;
  is_published: boolean;
}

export default function Blog() {
  const { blogPosts, loading, createBlogPost, updateBlogPost, deleteBlogPost } = useBlogPosts();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<BlogPostFormData>({
    defaultValues: {
      id: '',
      title: "",
      short_description: "",
      cover_image: "",
      content: "",
      is_published: false,
    }
  });

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.short_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "published" && post.is_published) ||
      (statusFilter === "draft" && !post.is_published);

    return matchesSearch && matchesStatus;
  });

  // const handleFormSubmit = async (data: BlogPostFormData) => {
  //   try {
  //     if (editingPost) {
  //       await updateBlogPost(editingPost.id, data);
  //     } else {
  //       await createBlogPost(data);
  //     }
  //     setIsDialogOpen(false);
  //     setEditingPost(null);
  //     reset();
  //   } catch (error) {
  //     console.error('Error saving blog post:', error);
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

  const handleFormSubmit = async (data: BlogPostFormData) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();
      formData.append("title", data.title);
      formData.append("short_description", data.short_description);
      formData.append("blog", data.content);
      formData.append("is_published", String(data.is_published));
      formData.append('created_at', created_at)
      if (data.cover_image instanceof File) {
        formData.append("image", data.cover_image);
      }

      if (editingPost) {
        await updateBlogPost(editingPost.id, formData);
      } else {
        await createBlogPost({
          title: data.title,
          short_description: data.short_description,
          content: data.content,
          cover_image: data.cover_image,
          is_published: data.is_published,
          created_at: created_at
        });
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      reset();
    } catch (error) {
      console.error("Error saving testimonial:", error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setValue('id', post.id);
    setValue('title', post.title);
    setValue('short_description', post.short_description);
    setValue('cover_image', post.cover_image || '');
    setValue('content', post.content || '');
    setValue('is_published', post.is_published);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlogPost(id);
    }
  };

  const openContentDialog = (post: BlogPost) => {
    setViewingPost(post);
    setIsContentDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { reset(); setEditingPost(null); }} className="hover-scale">
              <Plus className="mr-2 h-4 w-4" />
              Add Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update the blog post details.' : 'Add a new blog post to your website.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input {...register('title', { required: true })} placeholder="Enter blog post title" />
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description *</Label>
                  <Textarea {...register('short_description', { required: true })} placeholder="Brief description of the post" />
                </div>

                <div>
                  <Label htmlFor="cover_image">Cover Image</Label>
                  <ImageUpload
                    value={
                      watch('id') === "" ? watch('cover_image') :
                      `https://back-end-for-xirfadsan.onrender.com/api/blog/image/${watch('id')}`
                    }
                    onChange={(url) => setValue('cover_image', url)}
                    bucket="service-images"
                    placeholder="Upload person image"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Full Content</Label>
                  <Textarea
                    {...register('content')}
                    placeholder="Write your blog post content here..."
                    rows={8}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={watch('is_published')}
                    onCheckedChange={(checked) => setValue('is_published', checked)}
                  />
                  <Label>Publish immediately</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPost ? 'Update Post' : 'Create Post'}
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
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>
                Manage your blog posts and their publication status
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blog posts..."
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
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{post.short_description}</TableCell>
                    <TableCell>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <LivePreview
                          type="blog"
                          data={{
                            ...post,
                            cover_image: typeof post.cover_image === "string" ? post.cover_image : "",
                          }}
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openContentDialog(post)}
                          className="hover-scale"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                          className="hover-scale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
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

      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingPost?.title}</DialogTitle>
            <DialogDescription>
              Blog post preview - {viewingPost?.is_published ? 'Published' : 'Draft'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingPost?.cover_image && (
              <img
                src={`https://back-end-for-xirfadsan.onrender.com/api/testimonial/image/${viewingPost.id}`}
                alt={viewingPost.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <p className="text-muted-foreground">{viewingPost?.short_description}</p>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{viewingPost?.content}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}