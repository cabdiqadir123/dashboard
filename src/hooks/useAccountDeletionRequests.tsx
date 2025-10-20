import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface AccountDeletionRequest {
  id: string;
  user_id?: string;
  user_email: string;
  reason?: string;
  confirmation_text: string;
  status: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
}

export const useAccountDeletionRequests = () => {
  const [deletionRequests, setDeletionRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDeletionRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://back-end-for-xirfadsan.onrender.com/api/account_delete/all"
      );

      // If your backend returns an array directly:
      const requests = res.data || [];

      // If backend wraps response like { success: true, data: [...] }:
      // const requests = res.data.data || [];

      setDeletionRequests(requests);
    } catch (err) {
      console.error("Error fetching deletion requests:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };


  const processRequest = async (id: string, status: 'approved' | 'rejected', processedBy?: string) => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .update({
          status,
          processed_by: processedBy,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDeletionRequests(prev => prev.map(request =>
        request.id === id ? data : request
      ));

      toast({
        title: "Success",
        description: `Deletion request ${status} successfully`,
      });
      return data;
    } catch (err) {
      console.error('Error processing deletion request:', err);
      toast({
        title: "Error",
        description: "Failed to process deletion request",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const response = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/account_delete/delete",
        { id },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Deletion request removed:", response.data);

      // Update local state
      setDeletionRequests((prev) => prev.filter((request) => request.id !== id));

      toast({
        title: "Success",
        description: "Deletion request removed successfully",
      });

      return response.data;
    } catch (err) {
      console.error("❌ Error deleting request:", err);

      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });

      throw err;
    }
  };


  useEffect(() => {
    fetchDeletionRequests();
  }, []);

  return {
    deletionRequests,
    loading,
    error,
    processRequest,
    deleteRequest,
    refetch: fetchDeletionRequests,
  };
};