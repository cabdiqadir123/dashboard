import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchWorkerServices = async (id?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('worker_services')
        .select(`
          id,
          worker_id,
          sub_service_id,
          sub_service:sub_services(
            id,
            name
          )
        `);

      if (id) {
        query = query.eq('worker_id', id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setWorkerServices(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching worker services:', err);
      setError('Failed to fetch worker services');
    } finally {
      setLoading(false);
    }
  };

  const assignServices = async (workerId: string, subServiceIds: string[]) => {
    try {
      // First, delete existing services for this worker
      const { error: deleteError } = await supabase
        .from('worker_services')
        .delete()
        .eq('worker_id', workerId);

      if (deleteError) throw deleteError;

      // Then, insert new services
      if (subServiceIds.length > 0) {
        const workerServicesData = subServiceIds.map(subServiceId => ({
          worker_id: workerId,
          sub_service_id: subServiceId
        }));

        const { error: insertError } = await supabase
          .from('worker_services')
          .insert(workerServicesData);

        if (insertError) throw insertError;
      }

      // Refresh the data
      fetchWorkerServices(workerId);

      return { success: true };
    } catch (err) {
      console.error('Error assigning services:', err);
      return { success: false, error: 'Failed to assign services' };
    }
  };

  const getWorkerServices = async (workerId: string) => {
    try {
      const { data, error } = await supabase
        .from('worker_services')
        .select('sub_service_id')
        .eq('worker_id', workerId);

      if (error) throw error;

      return (data || []).map(item => item.sub_service_id);
    } catch (err) {
      console.error('Error getting worker services:', err);
      return [];
    }
  };

  useEffect(() => {
    if (workerId) {
      fetchWorkerServices(workerId);
    } else {
      fetchWorkerServices();
    }
  }, [workerId]);

  return { 
    workerServices, 
    loading, 
    error, 
    assignServices, 
    getWorkerServices,
    refetch: () => fetchWorkerServices(workerId)
  };
};