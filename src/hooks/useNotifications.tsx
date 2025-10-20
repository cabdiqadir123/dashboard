import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import axios from "axios";

interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: 'Customer' | 'Staff' | 'Both';
  status: 'sent' | 'scheduled' | 'draft';
  sent_at?: string;
  scheduled_at?: string;
  recipient_count: number;
  read_count: number;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/notification/all');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const formattedNotifications: Notification[] = (data || []).map((notification: any) => ({
        id: notification.notification_id,
        title: notification.title || 'Untitled Notification',
        message: notification.message || '',
        recipients: (notification.recipient_role || 'both') as 'customers' | 'workers' | 'both',
        status: (notification.status || 'draft') as 'sent' | 'scheduled' | 'draft',
        sent_at: notification.sent_at || '',
        scheduled_at: notification.scheduled_at || '',
        recipient_count: Number(notification.recipient_count || 0),
        read_count: Number(notification.read_count || 0),
        created_at: notification.created_at || '',
      }));

      setNotifications(formattedNotifications);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };


  // const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at' | 'recipient_count' | 'read_count'>) => {
  //   try {
  //     const recipientCount = getRecipientCount(notificationData.recipients);

  //     const { data, error } = await supabase
  //       .from('notifications')
  //       .insert([{
  //         title: notificationData.title,
  //         message: notificationData.message,
  //         recipients: notificationData.recipients,
  //         status: notificationData.status,
  //         sent_at: notificationData.sent_at,
  //         scheduled_at: notificationData.scheduled_at,
  //         recipient_count: recipientCount,
  //         read_count: 0,
  //       }])
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     const newNotification: Notification = {
  //       id: data.id,
  //       title: data.title,
  //       message: data.message,
  //       recipients: data.recipients as 'customers' | 'workers' | 'both',
  //       status: data.status as 'sent' | 'scheduled' | 'draft',
  //       sent_at: data.sent_at,
  //       scheduled_at: data.scheduled_at,
  //       recipient_count: data.recipient_count || 0,
  //       read_count: data.read_count || 0,
  //       created_at: data.created_at,
  //     };

  //     setNotifications([newNotification, ...notifications]);
  //     return { success: true, data: newNotification };
  //   } catch (err) {
  //     console.error('Error creating notification:', err);
  //     return { success: false, error: 'Failed to create notification' };
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

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at' | 'recipient_count' | 'read_count'>) => {
    try {
      const created_at = getSomaliaTime();

      const sendresponse = await axios.post(
        'https://back-end-for-xirfadsan.onrender.com/api/send/send-data-to-all',
        {
          title: notificationData.title,     // notification title
          body: notificationData.message,    // notification body
          role: notificationData.recipients, // 'Customer' or 'Staff'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("✅ sended created:", sendresponse.data);


      // Step 2: Create staff linked to this user
      const notificationPayload = {
        from_type: 'Admin',
        from_id: 1,
        recipient_role: notificationData.recipients,
        user_id: 0,
        title: notificationData.title,
        message: notificationData.message,
        hasButton: 'No',
        hasBook_id: 0,
        hasBook_started: 'notPending',
        created_at
      };

      const response = await axios.post(
        "https://back-end-for-xirfadsan.onrender.com/api/notification/add",
        notificationPayload
      );

      console.log("✅ notification created:", response.data);

      const userId = response.data.id;

      // Step 3: Construct the Worker object for local state
      const newNotification: Notification = {
        id: userId,
        title: notificationData.title,
        message: notificationData.message,
        recipients: notificationData.recipients as 'Customer' | 'Staff' | 'Both',
        status: notificationData.status as 'sent' | 'scheduled' | 'draft',
        sent_at: notificationData.sent_at,
        scheduled_at: notificationData.scheduled_at,
        recipient_count: 0,
        read_count: 0,
        created_at: created_at,
      };

      setNotifications([newNotification, ...notifications]);

      return { success: true, data: newNotification };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Backend response error:", err.response?.data || err.message);
      } else {
        console.error("❌ Unknown error:", err);
      }
      return { success: false, error: "Failed to create notification" };
    }
  };

  const getRecipientCount = (recipients: 'customers' | 'workers' | 'both'): number => {
    // These would normally be dynamic queries, but for now using static counts
    switch (recipients) {
      case 'customers': return 1250;
      case 'workers': return 350;
      case 'both': return 1600;
      default: return 0;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, error, createNotification, refetch: fetchNotifications };
};