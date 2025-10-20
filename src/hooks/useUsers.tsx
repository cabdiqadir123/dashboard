import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Staff' | 'Admin';
  status: 'Active' | 'Inactive';
  created_at: string;
  booking_count?: number;
  password?: string;
  image: File | string;
  sex: 'Male' | 'Female',
  address: string
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/user/allNew');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      // Format user data similar to Supabase version
      const formattedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        status: user.status || 'inactive',
        created_at: user.created_at || '',
        booking_count: user.total_bookings || 0, // if backend sends this count
        profile_image: '/placeholder.svg',
        password: user.password || '', // optional — only if safe to include
        sex: user.sex,
        address: user.address
      }));

      setUsers(formattedUsers);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };


  // const updateUser = async (userId: string, updates: Partial<User>) => {
  //   try {
  //     const { error } = await supabase
  //       .from('users')
  //       .update(updates)
  //       .eq('id', userId);

  //     if (error) throw error;

  //     setUsers(users.map(user =>
  //       user.id === userId ? { ...user, ...updates } : user
  //     ));

  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error updating user:', err);
  //     return { success: false, error: 'Failed to update user' };
  //   }
  // };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const formData = new FormData();

      if (updates.name) formData.append("name", updates.name);
      if (updates.email) formData.append("email", updates.email);
      if (updates.password) formData.append("password", updates.password);
      if (updates.phone) formData.append("phone", updates.phone);
      if (updates.address) formData.append("address", updates.address);
      if (updates.sex) formData.append("sex", updates.sex);
      if (updates.role) formData.append("role", updates.role);       // ✅ only if defined
      if (updates.status) formData.append("status", updates.status); // ✅ only if defined

      if (updates.image instanceof File) {
        formData.append("image", updates.image);
      }

      console.log("🛰️ Sending update for user:", userId, updates);

      const userResponse = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/user/update/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ User updated:", userResponse.data);

      setUsers((users) =>
        users.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend update error:", userId, err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error updating worker:", err);
      }

      return { success: false, error: "Failed to update worker" };
    }
  };


  // const deleteUser = async (userId: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('users')
  //       .delete()
  //       .eq('id', userId);

  //     if (error) throw error;

  //     setUsers(users.filter(user => user.id !== userId));
  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error deleting user:', err);
  //     return { success: false, error: 'Failed to delete user' };
  //   }
  // };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId: string) => {
    try {

      // 2️⃣ Delete user next
      await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/user/delete",
        { id: userId }
      );
      console.log("✅ User deleted:", userId);

      // ✅ Remove from local state
      setUsers((prevusers) => prevusers.filter((u) => u.id !== userId));

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

  // const createUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('users')
  //       .insert([{
  //         name: userData.name,
  //         email: userData.email,
  //         phone: userData.phone,
  //         role: userData.role,
  //         status: userData.status || 'active',
  //         password: userData.password || 'defaultpass123',
  //         image: null
  //       }])
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     const newUser: User = {
  //       id: data.id,
  //       name: data.name,
  //       email: data.email || '',
  //       phone: data.phone || '',
  //       role: data.role as  'Customer' | 'Staff' | 'Admin',
  //       status: data.status as 'Active' | 'Inactive',
  //       created_at: data.created_at,
  //       booking_count: 0,
  //       image: null,
  //       password: data.password || '',
  //       sex: 'Male',
  //       address: ''
  //     };

  //     setUsers([newUser, ...users]);
  //     return { success: true, data: newUser };
  //   } catch (err) {
  //     console.error('Error creating user:', err);
  //     return { success: false, error: 'Failed to create user' };
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

  const createUser = async (userData: Omit<User, 'id' | 'created_at'> & { password?: string }) => {
    try {
      const created_at = getSomaliaTime();
      const formData = new FormData();

      // Append all required fields
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("password", userData.password || "defaultpass123");
      formData.append("phone", userData.phone);
      formData.append("address", userData.address || "");
      formData.append("sex", userData.sex || "Male");
      formData.append("role", userData.role || 'Customer');
      formData.append("status", userData.status || "Active");
      formData.append("created_at", created_at);

      // Append image if it exists
      if (userData.image instanceof File) {
        formData.append("image", userData.image);
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

      // Step 3: Construct the Worker object for local state
      const newUser: User = {
        id: userId,
        name: userData.name,
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role as 'Customer' | 'Staff' | 'Admin',
        status: userData.status as 'Active' | 'Inactive',
        created_at: created_at,
        booking_count: 0,
        image: null,
        password: userData.password || '',
        sex: userData.sex,
        address: userData.sex
      };

      setUsers([newUser, ...users]);

      return { success: true, data: newUser };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend response error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error:", err);
      }
      return { success: false, error: "Failed to create worker" };
    }
  };

  return { users, loading, error, createUser, updateUser, deleteUser, refetch: fetchUsers };
};