import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { toast } from "sonner";

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.read).length);
    } catch (err) {
      // Silent fail
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    
    // Polling reduced to 5 minutes as a fallback
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Real-time listener
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log('New notification received via socket:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Visual feedback
      toast(notification.title, {
        description: notification.message,
      });
    };

    on('new_notification', handleNewNotification);
    return () => off('new_notification', handleNewNotification);
  }, [on, off]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const updated = prev.filter(n => n._id !== id);
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    } catch (err) {}
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markRead,
      markAllRead,
      deleteNotif
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
