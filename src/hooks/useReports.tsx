import { useEffect, useState } from 'react';

interface ReportStats {
  totalRevenue: number;
  totalBookings: number;
  activeUsers: number;
  completedBookings: number;
  pendingBookings: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  usersGrowth: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface BookingsByStatus {
  status: string;
  count: number;
}

export const useReports = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<BookingsByStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch data from your backend
      const [bookingsRes, usersRes, earningsRes] = await Promise.all([
        fetch('https://back-end-for-xirfadsan.onrender.com/api/booking/all'),
        fetch('https://back-end-for-xirfadsan.onrender.com/api/user/allNew'),
        fetch('https://back-end-for-xirfadsan.onrender.com/api/earning/all'),
      ]);

      const bookingsData = await bookingsRes.json();
      const usersData = await usersRes.json();
      const earningsData = await earningsRes.json();

      if (!bookingsRes.ok || !usersRes.ok || !earningsRes.ok) {
        throw new Error('API request failed');
      }

      // Calculate statistics
      const totalBookings = bookingsData?.length || 0;
      const completedBookings =
        bookingsData?.filter((b: any) => b.booking_status === 'Completed').length || 0;
      const pendingBookings =
        bookingsData?.filter((b: any) => b.booking_status === 'Pending').length || 0;
      const activeUsers = usersData?.filter((u: any) => u.status === 'Active').length || 0;
      const totalRevenue =
        earningsData?.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0;

      // Fake growth (you can add real logic later)
      const revenueGrowth = 12;
      const bookingsGrowth = 8;
      const usersGrowth = 15;

      setStats({
        totalRevenue,
        totalBookings,
        activeUsers,
        completedBookings,
        pendingBookings,
        revenueGrowth,
        bookingsGrowth,
        usersGrowth,
      });

      // Monthly revenue calculation
      const monthlyData: { [key: string]: number } = {};
      earningsData?.forEach((payment: any) => {
        if (payment.created_at) {
          const month = new Date(payment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          });
          monthlyData[month] = (monthlyData[month] || 0) + Number(payment.amount || 0);
        }
      });

      const monthlyRevenueArray = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue,
      }));
      setMonthlyRevenue(monthlyRevenueArray);

      // Bookings by status
      const statusCounts: { [key: string]: number } = {};
      bookingsData?.forEach((booking: any) => {
        const status = booking.booking_status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const bookingsByStatusArray = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }));
      setBookingsByStatus(bookingsByStatusArray);

      setError(null);
    } catch (err) {
      console.error('❌ Error fetching report data:', err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const res = await fetch('https://back-end-for-xirfadsan.onrender.com/api/booking/all');
      const data = await res.json();

      if (!res.ok) throw new Error('Failed to fetch bookings for export');

      const csvContent = [
        'Booking ID,Customer,Worker,Status,Date,Time,Amount',
        ...(data || []).map(
          (b: any) =>
            `${b.id},${b.customer_name || 'Unknown'},${b.worker_name || 'Unknown'},${
              b.booking_status
            },${b.scheduled_date || ''},${b.scheduled_time || ''},${b.final_price || 0}`
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'bookings-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (err) {
      console.error('Error exporting CSV:', err);
      return { success: false, error: 'Failed to export CSV' };
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return {
    stats,
    monthlyRevenue,
    bookingsByStatus,
    loading,
    error,
    exportToCSV,
    refetch: fetchReportData,
  };
};