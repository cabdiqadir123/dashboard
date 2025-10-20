import { useEffect, useState } from 'react';

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeWorkers: number;
  totalWorkers: number;
  avgRating: number;
  totalJobs: number;
  totalRevenuePending: number;
  completedBookingsToday: number;
  pendingPayments: number;
  openComplaints: number;
  totalCategories: number;
  totalSubServices: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeWorkers: 0,
    totalWorkers: 0,
    avgRating: 0,
    totalJobs: 0,
    totalRevenuePending: 0,
    completedBookingsToday: 0,
    pendingPayments: 0,
    openComplaints: 0,
    totalCategories: 0,
    totalSubServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch all APIs in parallel
        const [
          usersRes,
          bookingsRes,
          paymentsRes,
          workersRes,
          complaintsRes,
          categoriesRes,
          subServicesRes,
        ] = await Promise.all([
          fetch('https://back-end-for-xirfadsan.onrender.com/api/user/all'),
          fetch('https://back-end-for-xirfadsan.onrender.com/api/booking/all'),
          fetch('https://back-end-for-xirfadsan.onrender.com/api/earning/all'),
          fetch('https://back-end-for-xirfadsan.onrender.com/api/staff/all_admin'),
          fetch('https://back-end-for-xirfadsan.onrender.com/api/complaint/all'),
          fetch('https://back-end-for-xirfadsan.onrender.com/api/services/all'),
          fetch('https://back-end-for-xirfadsan.onrender.com/api/subservices/allNew'),
        ]);

        // Convert to JSON
        const [
          users,
          bookings,
          payments,
          workers,
          complaints,
          categories,
          subServices,
        ] = await Promise.all([
          usersRes.json(),
          bookingsRes.json(),
          paymentsRes.json(),
          workersRes.json(),
          complaintsRes.json(),
          categoriesRes.json(),
          subServicesRes.json(),
        ]);

        // Calculate derived stats

        console.log("Total users is",users.length)
        const totalUsers = users.length || 0;
        console.log('totalUsers',totalUsers);
        const totalBookings = bookings.length || 0;
        console.log('totalBookings',totalBookings);

        const totalRevenue = payments
          .filter((p: any) => p.status === 'Completed')
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          console.log('totalRevenue',totalRevenue);

        const totalRevenuePending = payments
          .filter((p: any) => p.status === 'Pending')
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
          console.log('totalRevenuePending',totalRevenuePending);

        const totalWorkers = workers.length || 0;
        console.log('totalWorkers',totalWorkers);
        const activeWorkers = workers.filter((w: any) => w.status === 'Active').length;
        console.log('activeWorkers',activeWorkers);

        const avgRating =
          workers.length > 0
            ? workers.reduce((sum: number, w: any) => sum + Number(w.rating || 0), 0) / workers.length
            : 90;

        const totalJobs = workers.reduce((sum: number, w: any) => sum + Number(w.total_job || 0), 0);
        console.log('totalJobs',totalJobs);

        const completedBookingsToday = bookings.filter(
          (b: any) => b.booking_status === 'Completed'
        ).length;

       console.log('completedBookingsToday',completedBookingsToday);


        const pendingPayments = payments.filter(
          (p: any) => p.status === 'Pending'
        ).length;

        const openComplaints = complaints.filter(
          (c: any) => c.issue === 'Pending'
        ).length;

        console.log('pendingPayments',pendingPayments);

        const totalCategories = categories.length || 0;
        const totalSubServices = subServices.length || 0;

        console.log('totalCategories',totalCategories);
        console.log('totalSubServices',totalSubServices);

        // Update state
        setStats({
          totalUsers,
          totalBookings,
          totalRevenue,
          activeWorkers,
          totalWorkers,
          avgRating,
          totalJobs,
          totalRevenuePending,
          completedBookingsToday,
          pendingPayments,
          openComplaints,
          totalCategories,
          totalSubServices,
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};