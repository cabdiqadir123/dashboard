import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string | File;
  linkedin_profile?: string;
  is_active: boolean;
  created_at: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);

      const res = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/member/allNew");

      // Ensure it's an array, even if backend sends a single object
      const membersArray = Array.isArray(res.data) ? res.data : [res.data];

      // Add image URL and normalize fields
      const members = membersArray.map((member: any) => ({
        ...member,
        is_active: Boolean(member.is_active), // convert 1 → true
        image: `https://back-end-for-xirfadsan.onrender.com/api/member/image/${member.id}`, // attach image URL
      }));

      setTeamMembers(members);
      setError(null);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };



  // const fetchTeamMembers = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get('https://back-end-for-xirfadsan.onrender.com/api/member/allNew');
  //     const data = res.data || [];

  //     setTeamMembers(data || []);
  //     setError(null);
  //   } catch (err: any) {
  //     console.error('Error fetching member:', err);
  //     setError(err.message || 'Failed to fetch member');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const createTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('team_members')
  //       .insert([teamMember])
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     setTeamMembers(prev => [data, ...prev]);
  //     toast({
  //       title: "Success",
  //       description: "Team member added successfully",
  //     });
  //     return data;
  //   } catch (err) {
  //     console.error('Error creating team member:', err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to add team member",
  //       variant: "destructive",
  //     });
  //     throw err;
  //   }
  // };

  const getSomaliaTime = (): string => {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const somaliaTime = new Date(utc + 3 * 3600000); // UTC+3

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${somaliaTime.getFullYear()}-${pad(somaliaTime.getMonth() + 1)}-${pad(somaliaTime.getDate())} ` +
      `${pad(somaliaTime.getHours())}:${pad(somaliaTime.getMinutes())}:${pad(somaliaTime.getSeconds())}`;
  };

  // ✅ Create testimonial (with image)
  const createTeamMember = async (teamMember: { name: string; linkedin_profile: string; role: string; image: string | File | null; is_active: boolean; created_at: string }) => {
    try {
      const formData = new FormData();
      const created_at = getSomaliaTime();
      formData.append('name', teamMember.name);
      formData.append('role', teamMember.role);
      formData.append('linkedin_profile', teamMember.linkedin_profile);
      formData.append('is_active', teamMember.is_active == true ? "1" : "0");
      formData.append('created_at', created_at)
      if (teamMember.image) formData.append('image', teamMember.image);

      const res = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/member/addNew', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: 'Success',
        description: 'Testimonial created successfully',
      });

      console.log('Sending testimonial data:', res.data);

      // Add new testimonial to state
      const newMember = { ...teamMember, id: res.data.id || Date.now().toString() };
      setTeamMembers((prev) => [newMember as any, ...prev]);
      return res.data;
    } catch (err) {
      console.error("❌ Backend response error:", err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to create testimonial',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('team_members')
  //       .update(updates)
  //       .eq('id', id)
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     setTeamMembers(prev => prev.map(member => member.id === id ? data : member));
  //     toast({
  //       title: "Success",
  //       description: "Team member updated successfully",
  //     });
  //     return data;
  //   } catch (err) {
  //     console.error('Error updating team member:', err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to update team member",
  //       variant: "destructive",
  //     });
  //     throw err;
  //   }
  // };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const res = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/member/updateNew/${id}`,
        updates,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Sending member data:', res.data);

      toast({ title: 'Success', description: 'Testimonial updated successfully' });
      setTeamMembers((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === id ? { ...cat, ...updates } : cat
        )
      );
      return res.data;
    } catch (err) {
      console.error("❌ Backend response error:", err.response?.data || err.message);
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // const deleteTeamMember = async (id: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('team_members')
  //       .delete()
  //       .eq('id', id);

  //     if (error) throw error;

  //     setTeamMembers(prev => prev.filter(member => member.id !== id));
  //     toast({
  //       title: "Success",
  //       description: "Team member removed successfully",
  //     });
  //   } catch (err) {
  //     console.error('Error deleting team member:', err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to remove team member",
  //       variant: "destructive",
  //     });
  //     throw err;
  //   }
  // };

  const deleteTeamMember = async (id: string) => {
    try {

      const res = await axios.post("https://back-end-for-xirfadsan.onrender.com/api/member/delete", {
        testimonial_id: id
      });

      setTeamMembers((prev) => prev.filter((t) => t.id !== id));

      console.log('Sending testimonial data:', id);

      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully',
      });
    } catch (err) {
      console.error('❌ Error deleting testimonial:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    error,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    refetch: fetchTeamMembers,
  };
};