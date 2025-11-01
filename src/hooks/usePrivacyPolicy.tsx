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
      setPrivacyPolicySections(response.data || []);
    } catch (err) {
      console.error("❌ Error fetching privacy policy sections:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };


  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  // ✅ Create new privacy policy section
  const createPrivacyPolicySection = async (newSection: {
    section_title: string;
    section_content: string;
  }) => {
    try {
      const created_at = getSomaliaTime();

      const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        const dd = pad(date.getDate());
        const mm = pad(date.getMonth() + 1);
        const yy = date.getFullYear().toString();
        return `${yy}-${mm}-${dd}`;
      };

      const payload = {
        ...newSection,
        section_order: privacyPolicySections.length + 1,
        last_updated: formatDate(new Date()),
        effective_date: formatDate(new Date()),
        created_at
      };

      const response = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/privacy/add",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ Update local state instantly
      setPrivacyPolicySections((prev) => [...prev, response.data]);

      toast({
        title: "Success",
        description: "New privacy policy section added successfully",
      });

      return response.data;
    } catch (err) {
      console.error("❌ Error creating new privacy policy section:", err);
      toast({
        title: "Error",
        description: "Failed to create new privacy policy section",
        variant: "destructive",
      });
      throw err;
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
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select();

      if (error) throw error;

      setPrivacyPolicySections((prev) =>
        prev.map((section) => ({
          ...section,
          effective_date: effectiveDate,
          last_updated: new Date().toISOString(),
        }))
      );

      toast({
        title: "Success",
        description: "Effective date updated for all sections",
      });
      return data;
    } catch (err) {
      console.error("❌ Error updating effective date:", err);
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
    createPrivacyPolicySection, // ✅ new
    updateAllSectionsEffectiveDate,
    refetch: fetchPrivacyPolicySections,
  };
};