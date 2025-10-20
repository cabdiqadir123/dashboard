import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface BlogPost {
  id: string;
  title: string;
  short_description: string;
  content?: string;
  cover_image?: string | File;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  // ✅ Fetch blog posts
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://back-end-for-xirfadsan.onrender.com/api/blog/all');
      const data = res.data || [];

      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled Blog',
        short_description: item.short_description || '',
        content: item.blog || '',
        cover_image: item.image_url || '',
        is_published: Boolean(item.is_published == 1),
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      }));

      setBlogPosts(formatted);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching blog posts:', err);
      setError(err.message || 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create blog post
  const createBlogPost = async (post: {
    title: string;
    short_description: string;
    content: string;
    cover_image?: string | File | null;
    is_published: boolean;
    created_at: string
  }) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();

      formData.append('title', post.title);
      formData.append('short_description', post.short_description);
      formData.append('blog', post.content);
      formData.append('is_published', post.is_published ? "1" : "0");
      formData.append('created_at', created_at);

      if (post.cover_image) formData.append('image', post.cover_image);

      const res = await axios.post(
        'https://back-end-for-xirfadsan.onrender.com/api/blog/add_New',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });

      const newPost = {
        ...post,
        id: res.data.id || Date.now().toString(),
        created_at,
        updated_at: created_at,
      };

      setBlogPosts((prev) => [newPost as any, ...prev]);
      return res.data;
    } catch (err) {
      console.error('❌ Error creating blog post:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // ✅ Update blog post
  const updateBlogPost = async (id: string, updates: FormData) => {
    try {
      const res = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/blog/updateNew/${id}`,
        updates,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast({ title: 'Success', description: 'Blog post updated successfully' });
      fetchBlogPosts(); // Refresh
      return res.data;
    } catch (err) {
      console.error('❌ Error updating blog post:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to update blog post',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // ✅ Delete blog post
  const deleteBlogPost = async (id: string) => {
    try {
      const res = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/blog/delete', { id: id });

      setBlogPosts((prev) => prev.filter((b) => b.id !== id));

      toast({ title: 'Success', description: 'Blog post deleted successfully' });
      return res.data;
    } catch (err) {
      console.error('❌ Error deleting blog post:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return {
    blogPosts,
    loading,
    error,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    refetch: fetchBlogPosts,
  };
};