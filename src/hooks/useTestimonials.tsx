import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface Testimonial {
  id: string;
  title: string;
  description: string;
  person_image?: string | File;
  person_name: string;
  person_role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // ✅ Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://back-end-for-xirfadsan.onrender.com/api/testimonial/all');
      const data = res.data || [];

      const formatted = data.map((item: any) => ({
        id: item.testimonial_id,
        title: item.title || 'Untitled Testimonial',
        description: item.description || '',
        person_image: item.image_url || '',
        person_name: item.name || 'Anonymous',
        person_role: item.person_role || 'Customer',
        is_active: Boolean(item.is_active == 1 ? true : false),
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      }));

      setTestimonials(formatted);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching testimonials:', err);
      setError(err.message || 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  // ✅ Create testimonial (with image)
  const createTestimonial = async (testimonial: { person_name: string; description: string; person_image: string | File | null; title: string, is_active: boolean; person_role: string, created_at: string }) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();
      formData.append('name', testimonial.person_name);
      formData.append('person_role', testimonial.person_role);
      formData.append('title', testimonial.title);
      formData.append('description', testimonial.description);
      formData.append('is_active', testimonial.is_active == true ? "1" : "0");
      formData.append('created_at', created_at)
      if (testimonial.person_image) formData.append('image', testimonial.person_image);

      const res = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/testimonial/addNew', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: 'Success',
        description: 'Testimonial created successfully',
      });

      console.log('Sending testimonial data:', res.data);

      // Add new testimonial to state
      const newTestimonial = { ...testimonial, id: res.data.id || Date.now().toString() };
      setTestimonials((prev) => [newTestimonial as any, ...prev]);
      return res.data;
    } catch (err) {
      console.error("❌ Backend response error:", err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to create testimonial',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // ✅ Update testimonial (Node API)
  const updateTestimonial = async (id: string, updates: FormData) => {
    try {
      const res = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/testimonial/updateNew/${id}`,
        updates,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Sending testimonial data:', res.data);

      toast({ title: 'Success', description: 'Testimonial updated successfully' });
      fetchTestimonials(); // Refresh
      return res.data;
    } catch (err) {
      console.error("❌ Backend response error:", err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to update testimonial',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // ✅ Delete testimonial
  const deleteTestimonial = async (id: string) => {
    try {

      const res = await axios.post("https://back-end-for-xirfadsan.onrender.com/api/testimonial/delete", {
        testimonial_id:id
      });

      setTestimonials((prev) => prev.filter((t) => t.id !== id));

      console.log('Sending testimonial data:', id);

      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully',
      });
    } catch (err) {
      console.error('❌ Error deleting testimonial:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return {
    testimonials,
    loading,
    error,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    refetch: fetchTestimonials,
  };
};