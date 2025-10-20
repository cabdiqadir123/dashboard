import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios
  from 'axios';
interface Complaint {
  id: string;
  complaint_number: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  customer_name: string;
  booking_id?: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/complaint/all');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedComplaints: Complaint[] = (data || []).map((complaint: any) => ({
        id: complaint.complaint_id,
        complaint_number: complaint.phone || '',
        subject: complaint.subject || 'No Subject',
        description: complaint.complaint || '',
        priority: complaint.priority || 'low',
        status: complaint.issue || 'open',
        customer_name: complaint.name || 'Unknown Customer',
        booking_id: complaint.book_id || null,
        created_at: complaint.created_at || '',
        resolved_at: complaint.resolved_at || null,
        resolution_notes: complaint.comment || '',
      }));

      setComplaints(formattedComplaints);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };


  const updateComplaintStatus = async (
    complaintId: string,
    issue_status: Complaint["status"],
    comment?: string
  ) => {
    try {
      // Prepare payload
      const updateData: any = { issue:issue_status };

      if (issue_status === "Resolved" || issue_status === "Review") {
        if (comment) {
          updateData.comment = comment;
        }
      }

      // 🛰️ Send update request to backend
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/complaint/update/${complaintId}`,
        updateData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("✅ Complaint updated:", response.data);

      // 🧠 Update local state
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? {
              ...complaint,
              issue_status,
              resolved_at: updateData.resolved_at || complaint.resolved_at,
              comment: updateData.comment || complaint.resolution_notes,
            }
            : complaint
        )
      );

      return { success: true };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Error updating complaint:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error updating complaint:", err);
      }

      return { success: false, error: "Failed to update complaint" };
    }
  };



  useEffect(() => {
    fetchComplaints();
  }, []);

  return { complaints, loading, error, updateComplaintStatus, refetch: fetchComplaints };
};