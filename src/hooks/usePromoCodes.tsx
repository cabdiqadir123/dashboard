import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from "axios";

interface PromoCode {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'Percantage' | 'Fixed_Amount';
  value: number;
  minimum_order: number;
  usage_limit: number;
  used_count: number;
  starts_at: string;
  expires_at: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  image: File | string;
  category_id: number;
  color: string;
}

export const usePromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/discount/allnew');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedPromoCodes: PromoCode[] = (data || []).map((promo: any) => ({
        id: promo.id,
        code: promo.promocode,
        title: promo.title || '',
        description: promo.description || '',
        type: promo.type || 'Fixed_Amount', // fallback type
        value: Number(promo.per || 0),
        minimum_order: Number(promo.min_order || 0),
        usage_limit: Number(promo.usage_limit || 0),
        used_count: Number(promo.used_count || 0),
        starts_at: promo.starts_at || '',
        expires_at: promo.end_date || '',
        status: promo.status || 'Inactive',
        created_at: promo.created_at || '',
        color: promo.color || '',
        category_id : promo.service_id || ''
      }));

      setPromoCodes(formattedPromoCodes);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching promo codes:', err);
      setError(err.message || 'Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };


  // const createPromoCode = async (promoData: Omit<PromoCode, 'id' | 'created_at' | 'used_count'>) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('promo_codes')
  //       .insert([{
  //         code: promoData.code,
  //         title: promoData.title,
  //         description: promoData.description,
  //         type: promoData.type,
  //         value: promoData.value,
  //         minimum_order: promoData.minimum_order,
  //         usage_limit: promoData.usage_limit,
  //         starts_at: promoData.starts_at,
  //         expires_at: promoData.expires_at,
  //         status: promoData.status,
  //       }])
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     const newPromoCode: PromoCode = {
  //       id: data.id,
  //       code: data.code,
  //       title: data.title,
  //       description: data.description || '',
  //       type: data.type as 'percentage' | 'fixed',
  //       value: Number(data.value),
  //       minimum_order: Number(data.minimum_order || 0),
  //       usage_limit: Number(data.usage_limit || 0),
  //       used_count: 0,
  //       starts_at: data.starts_at,
  //       expires_at: data.expires_at,
  //       status: data.status as 'active' | 'inactive',
  //       created_at: data.created_at,
  //       image: null,
  //       category_id: 0
  //     };

  //     setPromoCodes([newPromoCode, ...promoCodes]);
  //     return { success: true, data: newPromoCode };
  //   } catch (err) {
  //     console.error('Error creating promo code:', err);
  //     return { success: false, error: 'Failed to create promo code' };
  //   }
  // };

  const formatToMySQLDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Convert to Somalia local time (+3)
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000);

    const year = somaliaTime.getFullYear();
    const month = String(somaliaTime.getMonth() + 1).padStart(2, "0");
    const day = String(somaliaTime.getDate()).padStart(2, "0");
    const hours = String(somaliaTime.getHours()).padStart(2, "0");
    const minutes = String(somaliaTime.getMinutes()).padStart(2, "0");
    const seconds = String(somaliaTime.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const createPromoCode = async (
    promoData: Omit<PromoCode, 'id' | 'created_at' | 'used_count'>
  ) => {
    try {
      const created_at = getSomaliaTime();
      const formData = new FormData();

      // ✅ Convert numbers to strings using String() or template literals
      formData.append("service_id", String(promoData.category_id || ""));
      formData.append("promocode", promoData.code || "");
      formData.append("title", promoData.title || "Untitled Promo");
      formData.append("description", promoData.description || "");
      formData.append("type", promoData.type || "Percentage");
      formData.append("per", String(promoData.value || 0));
      formData.append("min_order", String(promoData.minimum_order || 0));
      formData.append("usage_limit", String(promoData.usage_limit || 0));
      formData.append("status", promoData.status || "Active");
      formData.append("end_date", formatToMySQLDateTime(promoData.expires_at));
      formData.append("color", promoData.color || "");
      formData.append("created_at", created_at);

      // ✅ Append image if provided
      if (promoData.image instanceof File) {
        formData.append("image", promoData.image);
      }

      // Optional token
      formData.append("token", "no token");

      // ✅ Make API request
      const response = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/discount/addNew",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Promo created:", response.data);

      const newPromo: PromoCode = {
        id: response.data.id,
        code: promoData.code,
        title: promoData.title,
        description: promoData.description,
        type: promoData.type,
        value: promoData.value,
        minimum_order: promoData.minimum_order,
        usage_limit: promoData.usage_limit,
        used_count: 0,
        starts_at: promoData.starts_at,
        expires_at: promoData.expires_at,
        status: promoData.status,
        created_at,
        image: promoData.image,
        category_id: promoData.category_id,
        color: promoData.color,
      };

      setPromoCodes((prev) => [newPromo, ...prev]);
      return { success: true, data: newPromo };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend response error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error:", err);
      }
      return { success: false, error: "Failed to create promo code" };
    }
  };

  // const updatePromoCode = async (promoId: string, updates: Partial<PromoCode>) => {
  //   try {
  //     const { error } = await supabase
  //       .from('promo_codes')
  //       .update({
  //         code: updates.code,
  //         title: updates.title,
  //         description: updates.description,
  //         type: updates.type,
  //         value: updates.value,
  //         minimum_order: updates.minimum_order,
  //         usage_limit: updates.usage_limit,
  //         starts_at: updates.starts_at,
  //         expires_at: updates.expires_at,
  //         status: updates.status,
  //       })
  //       .eq('id', promoId);

  //     if (error) throw error;

  //     setPromoCodes(promoCodes.map(promo =>
  //       promo.id === promoId ? { ...promo, ...updates } : promo
  //     ));

  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error updating promo code:', err);
  //     return { success: false, error: 'Failed to update promo code' };
  //   }
  // };

  const updatePromoCode = async (promoId: string, updates: Partial<PromoCode>) => {
    try {
      const formData = new FormData();

      if (updates.category_id) formData.append("service_id", String(updates.category_id));
      if (updates.code) formData.append("promocode", updates.code);
      if (updates.title) formData.append("title", updates.title);
      if (updates.description) formData.append("description", updates.description);
      if (updates.type) formData.append("type", updates.type);
      if (updates.value !== undefined) formData.append("per", String(updates.value));
      if (updates.minimum_order !== undefined) formData.append("min_order", String(updates.minimum_order));
      if (updates.usage_limit !== undefined) formData.append("usage_limit", String(updates.usage_limit));
      if (updates.status) formData.append("status", updates.status);
      if (updates.expires_at) formData.append("end_date", formatToMySQLDateTime(updates.expires_at));
      if (updates.color) formData.append("color", updates.color);
      if (updates.image instanceof File) formData.append("image", updates.image);

      // Append new image if provided
      if (updates.image instanceof File) {
        formData.append("image", updates.image);
      }

      console.log("🛰️ Sending update for user:", promoId, updates);

      // Step 1: Update user record
      const userResponse = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/discount/updateNew/${promoId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ User updated:", userResponse.data);

      // ✅ Update local state
      setPromoCodes((promoCodes) =>
        promoCodes.map((w) => (w.id === promoId ? { ...w, ...updates } : w))
      );

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend update error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error updating promocode:", err);
      }

      return { success: false, error: "Failed to update promocode" };
    }
  };

  // const deletePromoCode = async (promoId: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('promo_codes')
  //       .delete()
  //       .eq('id', promoId);

  //     if (error) throw error;

  //     setPromoCodes(promoCodes.filter(promo => promo.id !== promoId));
  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error deleting promo code:', err);
  //     return { success: false, error: 'Failed to delete promo code' };
  //   }
  // };

  const deletePromoCode = async (promoId: string) => {
    try {
      console.log("🗑️ Deleting promocode:", { id: promoId,});

      // 1️⃣ Delete promocode first
      await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/discount/delete",
        { id: promoId } 
      );
      console.log("✅ promocode deleted:", promoId);

      // ✅ Remove from local state
      setPromoCodes((promoCodes) => promoCodes.filter((w) => w.id !== promoId));

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Error deleting promocode:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error deleting promocode:", err);
      }

      return { success: false, error: "Failed to delete promocode" };
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  return {
    promoCodes,
    loading,
    error,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    refetch: fetchPromoCodes
  };
};