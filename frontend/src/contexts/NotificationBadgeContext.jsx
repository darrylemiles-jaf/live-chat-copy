import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser } from 'utils/auth';
import { getNotifications } from 'api/chatApi';
import socketService from 'services/socketService';

const NotificationBadgeContext = createContext({
  bellCount: 0,
  chatBadgeCount: 0,
  decrementBell: () => { },
  resetAll: () => { },
});

export const NotificationBadgeProvider = ({ children }) => {
  const [bellCount, setBellCount] = useState(0);
  const [chatBadgeCount, setChatBadgeCount] = useState(0);
  // Track unread notification IDs we've already counted to prevent duplicate increments
  // when the server re-sends the same notification ID (upsert case for new_message type)
  const trackedUnreadIdsRef = useRef(new Set());

  const user = getCurrentUser();

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) return;
      try {
        const result = await getNotifications(user.id, 1, 100);
        if (result?.success) {
          setBellCount(result.unread_count || 0);
          const unreadMessages = result.data.filter((n) => n.type === 'new_message' && !n.is_read);
          setChatBadgeCount(unreadMessages.length);
          // Seed the set so live socket updates don't double-count existing unread notifications
          result.data.filter((n) => !n.is_read).forEach((n) => trackedUnreadIdsRef.current.add(n.id));
        }
      } catch (_) { }
    };
    fetchCounts();
  }, [user?.id]);

  useEffect(() => {
    const handle = (notification) => {
      if (notification.is_read) return;
      // If we already counted this notification ID, it's an upsert update — skip
      if (trackedUnreadIdsRef.current.has(notification.id)) return;

      trackedUnreadIdsRef.current.add(notification.id);
      setBellCount((c) => c + 1);
      if (notification.type === 'new_message') {
        setChatBadgeCount((c) => c + 1);
      }
    };

    let attached = false;
    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) {
        s.on('new_notification', handle);
        attached = true;
      }
    };

    tryAttach();
    const retry = setInterval(() => {
      if (attached) { clearInterval(retry); return; }
      tryAttach();
    }, 500);

    return () => {
      clearInterval(retry);
      socketService.socket?.off('new_notification', handle);
    };
  }, []);

  const decrementBell = useCallback((notification) => {
    if (!notification) return;
    if (trackedUnreadIdsRef.current.has(notification.id)) {
      trackedUnreadIdsRef.current.delete(notification.id);
      setBellCount((c) => Math.max(0, c - 1));
      if (notification.type === 'new_message') {
        setChatBadgeCount((c) => Math.max(0, c - 1));
      }
    }
  }, []);

  const resetAll = useCallback(() => {
    trackedUnreadIdsRef.current.clear();
    setBellCount(0);
    setChatBadgeCount(0);
  }, []);

  return (
    <NotificationBadgeContext.Provider value={{ bellCount, chatBadgeCount, decrementBell, resetAll }}>
      {children}
    </NotificationBadgeContext.Provider>
  );
};

export const useNotificationBadge = () => useContext(NotificationBadgeContext);
