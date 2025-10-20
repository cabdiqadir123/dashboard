import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from 'axios';

interface Payment {
  id: string;
  booking_id: string;
  customer_name: string;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  status: 'Pending' | 'Completed' | 'Refunded';
  transaction_id: string;
  created_at: string;
  paid_at?: string;
  service_name: string;
  phone:string
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/earning/all');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedPayments: Payment[] = (data || []).map((payment: any) => ({
        id: payment.id?.toString() || `1`,
        booking_id: payment.book_id,
        customer_name: payment.customer_name || 'Unknown Customer',
        amount: Number(payment.amount || 0),
        method: payment.payment_method || 'EVC', // fallback method if undefined
        status: payment.status || 'Pending', // fallback status if undefined
        transaction_id: payment.transaction_id || '',
        created_at: payment.created_at || '',
        paid_at: payment.paid_at || '',
        service_name: payment.service_name || 'Unknown Service',
        phone: payment.phone
      }));

      setPayments(formattedPayments);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };


  // const updatePaymentStatus = async (paymentId: string, status: Payment['status']) => {
  //   try {
  //     const updateData: any = { payment_status: status };
  //     if (status === 'Completed') {
  //       updateData.paid_at = new Date().toISOString();
  //     }

  //     const { error } = await supabase
  //       .from('payments')
  //       .update(updateData)
  //       .eq('id', paymentId);

  //     if (error) throw error;

  //     setPayments(payments.map(payment =>
  //       payment.id === paymentId
  //         ? {
  //           ...payment,
  //           status,
  //           paid_at: status === 'Completed' ? new Date().toISOString() : payment.paid_at
  //         }
  //         : payment
  //     ));

  //     return { success: true };
  //   } catch (err) {
  //     console.error('Error updating payment status:', err);
  //     return { success: false, error: 'Failed to update payment status' };
  //   }
  // };

  const updatePaymentStatus = async (paymentId: string, status: Payment['status']) => {
    try {
      // ✅ Update via backend API
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/earning/update/${paymentId}`,
        { status: status }, // use the key your backend expects
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error('Failed to update earning status on server');
      }

      // ✅ Update local state
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId ? { ...payment, status: status } : payment
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating earning status:', err);
      return { success: false, error: 'Failed to update earning status' };
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, updatePaymentStatus, refetch: fetchPayments };
};