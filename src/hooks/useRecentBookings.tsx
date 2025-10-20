import { useEffect, useState } from 'react';

interface RecentBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  service_name: string;
  worker_name: string;
  final_price: number;
  status: string;
  created_at: string;
  scheduled_date: string;
  scheduled_time: string;
}

export const useRecentBookings = (limit: number = 5) => {
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        setLoading(true);

        const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/booking/all');
        if (!response.ok) throw new Error('Failed to fetch bookings');

        const data: any[] = await response.json();

        // Sort by created_at descending
        const sorted = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Take top `limit` bookings
        const recent = sorted.slice(0, limit);

        // Format bookings
        const formatted: RecentBooking[] = recent.map(booking => ({
          id: booking.id,
          booking_number: booking.book_id,
          customer_name: booking.customer_name || 'Unknown Customer',
          service_name: booking.name || 'Service',
          worker_name: booking.staff_name || 'Unassigned',
          final_price: Number(booking.final_price || 0),
          status: booking.status || 'pending',
          created_at: booking.created_at,
          scheduled_date: booking.scheduled_date,
          scheduled_time: booking.scheduled_time,
        }));

        setBookings(formatted);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recent bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, [limit]);

  return { bookings, loading, error };
};