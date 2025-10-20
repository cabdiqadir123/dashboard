import { useEffect, useState } from 'react';

interface TopWorker {
  id: string;
  name: string;
  service: string;
  rating: number;
  total_jobs: number;
  hourly_rate: number;
}

export const useTopWorkers = (limit: number = 5) => {
  const [workers, setWorkers] = useState<TopWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopWorkers = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/staff/all_admin');
      if (!response.ok) throw new Error('Failed to fetch top workers');

      const data = await response.json();

      const formattedWorkers: TopWorker[] = (data || [])
        .map(worker => ({
          id: worker.id,
          name: worker.staff_name || 'Unknown Worker',
          service: worker.sub_service?.name || 'General Service',
          rating: Number(worker.average_rating || 0),
          total_jobs: Number(worker.total_job || 0),
          hourly_rate: Number(worker.hourly_rate || 12),
        }))
        .sort((a, b) => b.rating - a.rating || b.total_jobs - a.total_jobs) // Sort by rating, then total_jobs
        .slice(0, limit);

      setWorkers(formattedWorkers);
      setError(null);
    } catch (err) {
      console.error('Error fetching top workers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopWorkers();
  }, [limit]);

  return { workers, loading, error, refetch: fetchTopWorkers };
};