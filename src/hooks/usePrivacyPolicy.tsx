import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface PrivacyPolicySection {
  id: string;
  section_title: string;
  section_content: string;
  section_order: number;
  last_updated: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export const usePrivacyPolicy = () => {
  const [privacyPolicySections, setPrivacyPolicySections] = useState<PrivacyPolicySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPrivacyPolicySections = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://back-end-for-xirfadsan.onrender.com/api/privacy/all"
      );

      // Assuming your backend returns an array of sections
      setPrivacyPolicySections(response.data || []);
    } catch (err) {
      console.error("❌ Error fetching privacy policy sections:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };


  const updatePrivacyPolicySection = async (
    id: string,
    updates: Partial<PrivacyPolicySection>
  ) => {
    try {
      const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        const dd = pad(date.getDate());
        const mm = pad(date.getMonth() + 1);
        const yy = date.getFullYear().toString();
        return `${yy}-${mm}-${dd}`;
      };

      const last_updated = formatDate(new Date());
      const payload = {
        section_title: updates.section_title,
        section_content: updates.section_content,
        last_updated: last_updated,
      };

      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/privacy/update/${id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ Update local state
      setPrivacyPolicySections((prev) =>
        prev.map((section) =>
          section.id === id ? { ...section, ...payload } : section
        )
      );

      toast({
        title: "Success",
        description: "Privacy policy section updated successfully",
      });

      return response.data;
    } catch (err) {
      console.error("❌ Error updating privacy policy section:", err);
      toast({
        title: "Error",
        description: "Failed to update privacy policy section",
        variant: "destructive",
      });
      throw err;
    }
  };


  const updateAllSectionsEffectiveDate = async (effectiveDate: string) => {
    try {
      const { data, error } = await supabase
        .from('privacy_policy')
        .update({
          effective_date: effectiveDate,
          last_updated: new Date().toISOString(),
        })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all records
        .select();

      if (error) throw error;

      setPrivacyPolicySections(prev => prev.map(section => ({
        ...section,
        effective_date: effectiveDate,
        last_updated: new Date().toISOString(),
      })));

      toast({
        title: "Success",
        description: "Effective date updated for all sections",
      });
      return data;
    } catch (err) {
      console.error('Error updating effective date:', err);
      toast({
        title: "Error",
        description: "Failed to update effective date",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchPrivacyPolicySections();
  }, []);

  return {
    privacyPolicySections,
    loading,
    error,
    updatePrivacyPolicySection,
    updateAllSectionsEffectiveDate,
    refetch: fetchPrivacyPolicySections,
  };
};