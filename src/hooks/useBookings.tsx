import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';

interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  worker_name?: string;
  service_name: string;
  category: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  final_price: number;
  created_at: string;
  notes?: string;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/booking/all');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedBookings: Booking[] = (data || []).map((booking: any) => ({
        id: booking.id,
        booking_number: booking.book_id,
        customer_name: booking.customer_name || 'Unknown Customer',
        customer_email: booking.customer?.email || '',
        worker_name: booking.staff_name || 'Unassigned',
        service_name: booking.name || 'Service',
        category: booking.name || 'Unknown',
        status:
          booking.booking_status ||
          'pending', // fallback in case API returns null or empty
        scheduled_date: booking.startdate || '',
        scheduled_time: booking.Avialable_time || '',
        address: booking.address || 'Unknown Address',
        final_price: booking.final_price || booking.amount,
        created_at: booking.created_at || '',
        notes: booking.reason || ''
      }));

      setBookings(formattedBookings);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };


  // const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
  //   try {
  //     const { error } = await supabase
  //       .from('bookings')
  //       .update({ status })
  //       .eq('id', bookingId);

  //     if (error) throw error;

  //     setBookings(bookings.map(booking =>
  //       booking.id === bookingId ? { ...booking, status } : booking
  //     ));

  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error updating booking status:', err);
  //     return { success: false, error: 'Failed to update booking status' };
  //   }
  // };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      // ✅ Update via backend API
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/booking/updatestatus/${bookingId}`,
        { booking_status: status }, // use the key your backend expects
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error('Failed to update booking status on server');
      }

      // ✅ Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: status } : booking
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating booking status:', err);
      return { success: false, error: 'Failed to update booking status' };
    }
  };

  const assignWorker = async (bookingId: string, workerId: string) => {
    try {
      console.log("Booking ID:", bookingId);
      console.log("Worker ID selected:", workerId);

      const workerRes = await fetch('https://back-end-for-xirfadsan.onrender.com/api/staff/all_admin');
      if (!workerRes.ok) throw new Error('Failed to fetch workers');
      const workers = await workerRes.json();

      console.log("All workers:", workers);

      // Find using staff_id
      const worker = workers.find((w: any) => String(w.staff_id) === String(workerId));
      console.log("Matched worker:", worker);

      if (!worker) throw new Error('Worker not found');

      const updateRes = await fetch(
        `https://back-end-for-xirfadsan.onrender.com/api/booking/assignWorker/${bookingId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staff_id: workerId }),
        }
      );

      if (!updateRes.ok) throw new Error('Failed to update booking');

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, worker_name: worker.name, status: 'Confirmed' }
            : booking
        )
      );

      return { success: true };
    } catch (err: any) {
      console.error('❌ Backend update error:', err.message);
      return { success: false, error: err.message };
    }
  };


  // const updateBookingPrice = async (bookingId: string, price: number) => {
  //   try {
  //     const { error } = await supabase
  //       .from('bookings')
  //       .update({ final_price: price })
  //       .eq('id', bookingId);

  //     if (error) throw error;

  //     setBookings(bookings.map(booking =>
  //       booking.id === bookingId ? { ...booking, final_price: price } : booking
  //     ));

  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error updating booking price:', err);
  //     return { success: false, error: 'Failed to update booking price' };
  //   }
  // };

  const updateBookingPrice = async (bookingId: string, price: number, reason: string,) => {
    try {
      // ✅ Update via backend API
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/booking/updateamountNew/${bookingId}`,
        { amount: price, reason: reason }, // use the key your backend expects
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error('Failed to update booking price on server');
      }

      // ✅ Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, final_price: price } : booking
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating booking price:', err);
      return { success: false, error: 'Failed to update booking price' };
    }
  };


  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    updateBookingStatus,
    assignWorker,
    updateBookingPrice,
    refetch: fetchBookings
  };
};