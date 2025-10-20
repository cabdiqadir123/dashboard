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
      // First, get the user_id from worker_profiles since worker_id in bookings references users table
      const { data: workerProfile, error: workerProfileError } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .eq('id', workerId)
        .single();

      if (workerProfileError) throw workerProfileError;
      if (!workerProfile) throw new Error('Worker not found');

      const userId = workerProfile.user_id;

      // Now update the booking with the user_id
      const { error } = await supabase
        .from('bookings')
        .update({ worker_id: userId, status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      // Fetch worker name for local state update
      const { data: workerData } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single();

      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? {
            ...booking,
            worker_name: workerData?.name || 'Unknown Worker',
            status: 'Confirmed' as const
          }
          : booking
      ));

      return { success: true };
    } catch (err) {
      console.error('Error assigning worker:', err);
      return { success: false, error: 'Failed to assign worker' };
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