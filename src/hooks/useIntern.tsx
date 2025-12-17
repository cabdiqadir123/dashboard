import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = 'https://back-end-for-xirfadsan.onrender.com/api/intern';

export interface Intern {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  sex?: 'Male' | 'Female';
  status?: 'Active' | 'Unactive';
  profile_image?: string | File | null;
  created_at: string;
}

export const useInterns = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /* =========================
     TIME HELPER (SOMALIA)
  ========================= */
  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000);

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  /* =========================
     FETCH ALL INTERNS
  ========================= */
  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/all`);

      const data = Array.isArray(res.data) ? res.data : [res.data];

      setInterns(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching interns:', err);
      setError(err.message || 'Failed to fetch interns');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CREATE INTERN
  ========================= */
  const createIntern = async (intern: Omit<Intern, 'id' | 'created_at'>) => {
    try {
      const formData = new FormData();

      formData.append('name', intern.name);
      formData.append('email', intern.email);
      formData.append('phone', intern.phone || '');
      formData.append('address', intern.address || '');
      formData.append('role', intern.role || '');
      formData.append('sex', intern.sex || '');
      formData.append('status', intern.status || '');
      formData.append('created_at', getSomaliaTime());

      if (intern.profile_image) {
        formData.append('profile_image', intern.profile_image);
      }

      const res = await axios.post(`${BASE_URL}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: 'Success',
        description: 'Intern added successfully',
      });

      const newIntern = {
        ...intern,
        id: res.data.id,
        created_at: getSomaliaTime(),
      } as Intern;

      setInterns(prev => [newIntern, ...prev]);
      return res.data;
    } catch (err: any) {
      console.error('❌ Create intern error:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to add intern',
        variant: 'destructive',
      });
      throw err;
    }
  };

  /* =========================
     UPDATE INTERN (FIXED)
  ========================= */
  const updateIntern = async (id: string, updates: Partial<Intern>) => {
    try {
      const formData = new FormData();

      if (updates.name) formData.append('name', updates.name);
      if (updates.email) formData.append('email', updates.email);
      if (updates.phone) formData.append('phone', updates.phone);
      if (updates.phone) formData.append('address', updates.address);
      if (updates.role) formData.append('role', updates.role);
      if (updates.sex) formData.append('sex', updates.sex);
      if (updates.status) formData.append('status', updates.status);

      if (updates.profile_image instanceof File) {
        formData.append('profile_image', updates.profile_image);
      }

      const res = await axios.put(
        `${BASE_URL}/update/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast({
        title: 'Success',
        description: 'Intern updated successfully',
      });

      setInterns(prev =>
        prev.map(intern =>
          intern.id === id ? { ...intern, ...updates } : intern
        )
      );

      return res.data;
    } catch (err: any) {
      console.error('❌ Update intern error:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to update intern',
        variant: 'destructive',
      });
      throw err;
    }
  };

  /* =========================
     DELETE INTERN
  ========================= */
  const deleteIntern = async (id: string) => {
    try {
      await axios.post(`${BASE_URL}/delete`, { id });

      setInterns(prev => prev.filter(i => i.id !== id));

      toast({
        title: 'Success',
        description: 'Intern deleted successfully',
      });
    } catch (err: any) {
      console.error('❌ Delete intern error:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to delete intern',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  return {
    interns,
    loading,
    error,
    createIntern,
    updateIntern,
    deleteIntern,
    refetch: fetchInterns,
  };
};