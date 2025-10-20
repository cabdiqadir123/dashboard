import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from "axios";

interface SubService {
  id: string;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  price: number;
  duration_minutes: number;
  booking_count: number;
  image: string | File;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export const useSubServices = () => {
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubServices = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/subservices/allNew');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedSubServices: SubService[] = (data || []).map((subService: any) => ({
        id: subService.sub_service_id,
        name: subService.sub_service || 'Unnamed Sub-Service',
        description: subService.description || '',
        category_id: subService.service_id,
        category_name: subService.name || 'Unknown Category', // depends on your API structure
        price: Number(subService.price || 0),
        duration_minutes: subService.duration_minutes || 0,
        booking_count: subService.total_booked || 0,
        image: subService.image || '/placeholder.svg',
        status: subService.status || 'Inactive',
        created_at: subService.created_at || '',
      }));

      setSubServices(formattedSubServices);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching sub-services:', err);
      setError(err.message || 'Failed to fetch sub-services');
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

  const createSubService = async (
    subServiceData: Omit<
      SubService,
      "id" | "created_at" | "category_name" | "booking_count"
    >
  ) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();

      formData.append("sub_service", subServiceData.name);
      formData.append("description", subServiceData.description || "");
      formData.append("service_id", `${subServiceData.category_id}`);
      formData.append("price", String(subServiceData.price));
      formData.append("status", String(subServiceData.status));
      // 🖼️ Append image only if provided
      if (subServiceData.image instanceof File) {
        formData.append("image", subServiceData.image);
      }
      formData.append("created_at", created_at);

      console.log('Sending category data:', subServiceData);

      // 🛰️ Send POST request to your backend
      const response = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/subservices/add_new",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.error('Unexpected response: ', subServiceData.category_id, response.data);

      // Construct the new sub-service object (same structure as before)
      const newSubService: SubService = {
        id: response.data.id || Math.random().toString(),
        name: subServiceData.name,
        description: subServiceData.description || "",
        category_id: subServiceData.category_id,
        category_name: response.data.category_name || "Unknown Category",
        price: Number(subServiceData.price),
        duration_minutes: subServiceData.duration_minutes,
        booking_count: 0,
        image: response.data.image || "",
        status: subServiceData.status,
        created_at: created_at,
      };

      // ✅ Add to local state
      setSubServices([newSubService, ...subServices]);

      return { success: true, data: newSubService };
    } catch (err) {
      // Log full backend response for debugging
      if (axios.isAxiosError(err) && err.response) {
        console.error("❌ Backend response error:", err.response.data);
      } else {
        console.error("❌ Error creating sub-service:", err);
      }

      return { success: false, error: "Failed to create sub-service" };
    }
  };



  const updateSubService = async (subServiceId: string, updates: Partial<SubService>) => {
    try {
      const formData = new FormData();

      // Append all required fields
      if (updates.name) formData.append("sub_service", updates.name);
      if (updates.description) formData.append("description", updates.description);
      if (updates.category_id) formData.append("service_id", String(updates.category_id));
      if (updates.price) formData.append("price", `${updates.price}`);
      if (updates.price) formData.append("status", `${updates.status}`);
      // Append image only if it's a new file
      if (updates.image instanceof File) {
        formData.append("image", updates.image);
      }

      console.log('API response:', subServiceId);

      // 🛰️ Send PUT request to your backend API
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/subservices/updateNew/${subServiceId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Sub-service updated:", response.data);

      // ✅ Update local state
      setSubServices((prev) =>
        prev.map((sub) => (sub.id === subServiceId ? { ...sub, ...updates } : sub))
      );

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Error updating sub-service:", err.response?.data || err.message || err);
      } else {
        console.error("❌ Unknown error updating sub-service:", err);
      }
      return { success: false, error: "Failed to update sub-service" };
    }
  };


  const deleteSubService = async (subServiceId: string) => {
    try {
      console.log("🗑️ Deleting sub-service:", subServiceId);

      // 🛰️ Send delete request to your backend
      const response = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/subservices/delete",
        { sub_service_id: subServiceId }
      );

      console.log("✅ Backend delete response:", response.data);

      // 🧹 Remove it from local state
      setSubServices((prev) =>
        prev.filter((subService) => subService.id !== subServiceId)
      );

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "❌ Error deleting sub-service:",
          err.response?.data || err.message || err
        );
      } else {
        console.error("❌ Unknown error deleting sub-service:", err);
      }

      return { success: false, error: "Failed to delete sub-service" };
    }
  };


  const toggleStatus = async (subServiceId: string) => {
    const subService = subServices.find(s => s.id === subServiceId);
    if (!subService) return { success: false, error: 'Sub-service not found' };

    const newStatus = subService.status === 'Active' ? 'Inactive' : 'Active';
    return updateSubService(subServiceId, { status: newStatus });
  };

  useEffect(() => {
    fetchSubServices();
  }, []);

  return {
    subServices,
    loading,
    error,
    createSubService,
    updateSubService,
    deleteSubService,
    toggleStatus,
    refetch: fetchSubServices
  };
};