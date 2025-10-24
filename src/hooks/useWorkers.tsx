import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from "axios";

interface Worker {
  id: string;
  staff_id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  total_jobs: number;
  status: 'Active' | 'Inactive';
  location: string;
  services: string[];
  total_earnings: number;
  created_at: string;
  sex: 'Male' | 'Female';
  image: File | string;
  category_id: number;
  available: 'true' | 'false';
  password: string;
  servicename: string;
}

export const useWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/staff/all_admin');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedWorkers: Worker[] = (data || []).map((worker: any) => ({
        id: worker.staff_user_id,
        name: worker.staff_name || 'Unknown Worker',
        email: worker.staff_email || '',
        phone: worker.staff_phone || '',
        rating: Number(worker.rating || 0),
        total_jobs: Number(worker.total_jobs || 0),
        status: (worker.status || 'Inactive') as 'Active' | 'Inactive',
        location: worker.staff_address || 'Unknown',
        services: worker.servicename || "",
        total_earnings: Number(worker.total_earning || 0),
        created_at: worker.created_at || '',
        password: worker.password || '',
        sex: worker.sex || '',
        servicename: worker.servicename,
        category_id: worker.service_id,
        staff_id: worker.staff_id
      }));

      setWorkers(formattedWorkers);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching workers:', err);
      setError(err.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };


  const updateWorkerStatus = async (workerId: string, status: 'Active' | 'Inactive') => {
    try {
      // Find the worker in local state to get user_id
      const worker = workers.find(w => w.id === workerId);
      if (!worker) return { success: false, error: 'Worker not found' };

      // 🔄 Update backend via Axios
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/user/status/${workerId}`,
        { status },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ Worker status updated:', response.data);

      // 🧠 Update local state
      setWorkers(prev =>
        prev.map(w =>
          w.id === workerId ? { ...w, status } : w
        )
      );

      return { success: true };
    } catch (err) {
      console.error('❌ Error updating worker status:', err);
      return { success: false, error: 'Failed to update worker status' };
    }
  };

  const updateWorker = async (workerId: string, updates: Partial<Worker>) => {
    try {
      const formData = new FormData();

      // Append only fields that exist
      if (updates.name) formData.append("name", updates.name);
      if (updates.email) formData.append("email", updates.email);
      if (updates.password) formData.append("password", updates.password);
      if (updates.phone) formData.append("phone", updates.phone);
      if (updates.location) formData.append("address", updates.location);
      if (updates.sex) formData.append("sex", updates.sex);
      formData.append("role", 'Staff');
      if (updates.status) formData.append("status", updates.status);

      // Append new image if provided
      if (updates.image instanceof File) {
        formData.append("image", updates.image);
      }

      console.log("🛰️ id is this:", updates.password);

      console.log("🛰️ Sending update for user:", workerId, updates);

      // Step 1: Update user record
      const userResponse = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/user/update/${workerId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ User updated:", userResponse.data);

      // Step 2: Update staff profile (optional fields)
      const staffPayload: any = {};
      if (updates.category_id !== undefined) staffPayload.service_id = updates.category_id;
      if (updates.available !== undefined) staffPayload.available = updates.available;

      if (Object.keys(staffPayload).length > 0) {
        const staffResponse = await axios.put(
          `https://back-end-for-xirfadsan.onrender.com/api/staff/updateNew/${updates.id || workerId}`,
          staffPayload
        );
        console.log("✅ Staff profile updated:", staffResponse.data);
      }

      // ✅ Update local state
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) => (w.id === workerId ? { ...w, ...updates } : w))
      );

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend update error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error updating worker:", err);
      }

      return { success: false, error: "Failed to update worker" };
    }
  };


  useEffect(() => {
    fetchWorkers();
  }, []);

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  const createWorker = async (workerData: Omit<Worker, 'id' | 'created_at'> & { password?: string }) => {
    try {
      const created_at = getSomaliaTime();
      const formData = new FormData();

      // Append all required fields
      formData.append("name", workerData.name);
      formData.append("email", workerData.email);
      formData.append("password", workerData.password || "defaultpass123");
      formData.append("phone", workerData.phone);
      formData.append("address", workerData.location || "");
      formData.append("sex", workerData.sex || "Male");
      formData.append("role", "Staff");
      formData.append("status", workerData.status || "Active");
      formData.append("created_at", created_at);

      // Append image if it exists
      if (workerData.image instanceof File) {
        formData.append("image", workerData.image);
      }

      // Optional token for authentication if needed
      formData.append("token", 'no token');

      // Step 1: Create user via backend API
      const userResponse = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/user/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ User created:", userResponse.data);

      const userId = userResponse.data.id;

      // Step 2: Create staff linked to this user
      const staffPayload = {
        name: workerData.name,
        service_id: workerData.category_id || null,
        available: 'true',
        created_at
      };

      const staffResponse = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/staff/addNew",
        staffPayload
      );

      console.log("✅ Staff profile created:", staffResponse.data);

      // Step 3: Construct the Worker object for local state
      const newWorker: Worker = {
        id: userId,
        name: workerData.name,
        email: workerData.email,
        phone: workerData.phone,
        rating: 5.0,
        total_jobs: 0,
        status: workerData.status || "Active",
        location: workerData.location || "",
        services: ['Unkown'],
        total_earnings: 0,
        created_at,
        sex: workerData.sex || "Male",
        image: userResponse.data.image || null,
        category_id: null,
        available: 'true',
        password: workerData.password,
        servicename: workerData.servicename,
        staff_id: workerData.staff_id
      };

      setWorkers([newWorker, ...workers]);

      return { success: true, data: newWorker };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend response error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error:", err);
      }
      return { success: false, error: "Failed to create worker" };
    }
  };


  const deleteWorker = async (workerId: string) => {
    try {
      console.log("🗑️ Deleting worker:", { user_id: workerId, });

      // 1️⃣ Delete staff first
      await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/staff/deleteNew",
        { staff_id: workerId } // make sure you pass staffId if it's different from workerId
      );
      console.log("✅ Staff deleted:", workerId);

      // 2️⃣ Delete user next
      await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/user/delete",
        { id: workerId }
      );
      console.log("✅ User deleted:", workerId);

      // ✅ Remove from local state
      setWorkers((prevWorkers) => prevWorkers.filter((w) => w.id !== workerId));

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Error deleting worker:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error deleting worker:", err);
      }

      return { success: false, error: "Failed to delete worker" };
    }
  };


  return { workers, loading, error, createWorker, updateWorker, updateWorkerStatus, deleteWorker, refetch: fetchWorkers };
};