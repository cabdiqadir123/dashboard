import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string | File | null;
  secondary_image?: string | File | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  sub_services_count: number;
  total_revenue: number;
  color: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/services/allNew');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedCategories: Category[] = (data || []).map((category: any) => ({
        id: category.service_id?.toString() || '',
        name: category.name || 'Unnamed',
        description: category.description || 'DESCRIPTOON',
        image: category.image || null,
        secondary_image: category.secondary_image || null,
        status: category.status || 'Inactive',
        created_at: category.created_at || '',
        total_revenue: Number(category.total_revenue || 0),
        sub_services_count: category.sub_services_count || 0, // Adjust this based on your API response
        color: category.color || '',
      }));

      setCategories(formattedCategories);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
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

  const createCategory = async (
    categoryData: Omit<Category, 'id' | 'created_at' | 'sub_services_count' | 'total_revenue'>
  ) => {
    try {
      const created_at = getSomaliaTime();

      const color = "#923a3a";

      const formData = new FormData();
      formData.append('name', categoryData.name);
      if (categoryData.image) formData.append('image', categoryData.image);
      if (categoryData.secondary_image) formData.append('secondry_image', categoryData.secondary_image);
      if (categoryData.color) formData.append('color', categoryData.color);
      if (categoryData.status) formData.append('status', categoryData.status);
      formData.append('created_at', created_at);

      console.log('Sending category data:', categoryData.secondary_image);

      const response = await axios.post(
        'https://back-end-for-xirfadsan.onrender.com/api/services/add',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('API response:', response.data.status);

      const newCategory: Category = {
        id: response.data.id.toString(),
        name: response.data.name,
        description: response.data.description || '',
        image: null,
        secondary_image: null,
        status: response.data.status as 'Active' | 'Inactive',
        created_at: response.data.created_at,
        total_revenue: Number(response.data.total_revenue || 0),
        sub_services_count: 0,
        color:response.data.color
      };

      setCategories([newCategory, ...categories]);

      return { success: true, data: newCategory };
    } catch (err: any) {
      console.error('Error creating category:', err.response?.data || err.message || err);
      return { success: false, error: err.response?.data?.message || 'Failed to create category' };
    }
  };


  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const formData = new FormData();
      if (updates.name) formData.append("name", updates.name);
      if (updates.status) formData.append("status", updates.status);
      if (updates.color) formData.append("color", updates.color);
      // Handle images (if provided)
      if (updates.image) formData.append('image', updates.image);
      if (updates.secondary_image) formData.append('secondry_image', updates.secondary_image);

      // 🛰️ Send PUT request to your API
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/services/update/${categoryId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.error('Unexpected response:', response.data);

      // ✅ Optimistically update local state
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        )
      );

      return { success: true };
    } catch (err) {
      console.error("Error updating category:", err);
      return { success: false, error: "Failed to update category" };
    }
  };


  const deleteCategory = async (categoryId: string) => {
    try {
      // 🛰️ Call your backend API
      const response= await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/services/delete",
        { service_id: categoryId }
      );

      // ✅ Remove from local state
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryId)
      );

      return { success: true };
    } catch (err) {
      console.error("Error deleting category:", err);
      return { success: false, error: "Failed to delete category" };
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, createCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};