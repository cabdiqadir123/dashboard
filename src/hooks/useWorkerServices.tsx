import { useEffect, useState } from 'react';

interface WorkerService {
  id: string;
  worker_id: string;
  sub_service_id: string;
  sub_service: {
    id: string;
    name: string;
  };
}

export const useWorkerServices = (workerId?: string) => {
  const [workerServices, setWorkerServices] = useState<WorkerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch worker services from backend
  const fetchWorkerServices = async (id?: string) => {
    try {
      setLoading(true);
      const url = 'https://back-end-for-xirfadsan.onrender.com/api/staff/services/all';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch worker services');
      const data = await res.json();
      setWorkerServices(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching worker services:', err);
      setError('Failed to fetch worker services');
    } finally {
      setLoading(false);
    }
  };

  // Assign services to a worker
  const assignServices = async (workerId: string, subServiceIds: string[]) => {
    try {
      const res = await fetch(
        `https://back-end-for-xirfadsan.onrender.com/api/staff/assign-services/${workerId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sub_service_ids: subServiceIds }),
        }
      );

      if (!res.ok) throw new Error('Failed to assign services');

      await fetchWorkerServices(workerId);
      return { success: true };
    } catch (err) {
      console.error('Error assigning services:', err);
      return { success: false, error: 'Failed to assign services' };
    }
  };

  // Get only sub_service_ids for a worker
  const getWorkerServices = async (workerId: string) => {
    try {
      const res = await fetch(
        `https://back-end-for-xirfadsan.onrender.com/api/staff/services/${workerId}`
      );
      if (!res.ok) throw new Error('Failed to get worker services');
      const data = await res.json();
      return (data || []).map((item: WorkerService) => item.sub_service_id);
    } catch (err) {
      console.error('Error getting worker services:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchWorkerServices(workerId);
  }, [workerId]);

  return {
    workerServices,
    loading,
    error,
    assignServices,
    getWorkerServices,
    refetch: () => fetchWorkerServices(workerId),
  };
};