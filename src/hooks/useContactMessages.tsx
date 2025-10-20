import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  replied_at?: string;
  created_at: string;
}

export const useContactMessages = () => {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContactMessages = async () => {
    try {
      setLoading(true);

      const res = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/contact/all");

      // If your backend returns an array directly:
      const messages = res.data || [];

      // If backend returns wrapped response like { success: true, data: [...] } use:
      // const messages = res.data.data || [];

      setContactMessages(messages);

      console.log(res.data);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (id: string) => {
    try {
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/contact/update_is_read/${id}`,
        { is_read: true },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Message marked as read:", id);

      // Update local state
      setContactMessages((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, is_read: true } : message
        )
      );

      toast({
        title: "Success",
        description: "Message marked as read",
      });

      return response.data;
    } catch (err) {
      console.error("❌ Error marking message as read:", id, err.response?.data || err.message);
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
      throw err;
    }
  };


  // const markAsReplied = async (id: string) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('contact_messages')
  //       .update({
  //         is_read: true,
  //         replied_at: new Date().toISOString()
  //       })
  //       .eq('id', id)
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     setContactMessages(prev => prev.map(message =>
  //       message.id === id ? data : message
  //     ));

  //     toast({
  //       title: "Success",
  //       description: "Message marked as replied",
  //     });
  //     return data;
  //   } catch (err) {
  //     console.error('Error marking message as replied:', err);
  //     toast({
  //       title: "Error",
  //       description: "Failed to mark message as replied",
  //       variant: "destructive",
  //     });
  //     throw err;
  //   }
  // };

  const markAsReplied = async (id: string) => {
    try {
      const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        const dd = pad(date.getDate());
        const mm = pad(date.getMonth() + 1);
        const yy = date.getFullYear().toString();
        const h = pad(date.getHours());
        const m = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${dd}/${mm}/${yy} ${h}:${m}:${s}`;
      };

      const replied_at = formatDate(new Date());
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/contact/update_replied_at/${id}`,
        {
          is_read: true,
          replied_at: replied_at
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Message marked as replied:", id);

      // Update local state
      setContactMessages((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, ...response.data } : message
        )
      );

      toast({
        title: "Success",
        description: "Message marked as replied",
      });

      return response.data;
    } catch (err) {
      console.error("❌ Error marking message as replied:", id, err.response?.data || err.message);
      toast({
        title: "Error",
        description: "Failed to mark message as replied",
        variant: "destructive",
      });
      throw err;
    }
  };


  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContactMessages(prev => prev.filter(message => message.id !== id));
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchContactMessages();
  }, []);

  return {
    contactMessages,
    loading,
    error,
    markAsRead,
    markAsReplied,
    deleteMessage,
    refetch: fetchContactMessages,
  };
};