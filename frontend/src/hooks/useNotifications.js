import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../api/chatApi';
import socketService from '../services/socketService';
import { applyFilters, groupByDate } from '../utils/notifications/notificationTransformers';

const useNotifications = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedTab, setSelectedTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilters, setTypeFilters] = useState({ message: true, assignment: true });

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredNotifications = useMemo(
    () => applyFilters(notifications, { selectedTab, dateFilter, typeFilters }),
    [notifications, selectedTab, dateFilter, typeFilters]
  );

  const groupedNotifications = useMemo(
    () => groupByDate(filteredNotifications),
    [filteredNotifications]
  );

  const groupKeys = Object.keys(groupedNotifications);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const result = await getNotifications(user.id, pageNum, 30);
        if (result?.success) {
          setNotifications((prev) =>
            append ? [...prev, ...result.data] : result.data
          );
          setUnreadCount(result.unread_count || 0);
          setHasMore(pageNum < result.pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          // Update in place and move to top
          return [notification, ...prev.filter((n) => n.id !== notification.id)];
        }
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    const attach = () => {
      const socket = socketService.socket;
      if (socket) {
        socket.off('new_notification', handleNewNotification);
        socket.on('new_notification', handleNewNotification);
      }
    };

    attach();

    const interval = setInterval(attach, 3000);

    return () => {
      clearInterval(interval);
      const socket = socketService.socket;
      if (socket) socket.off('new_notification', handleNewNotification);
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleTypeFilter = (key) => {
    setTypeFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (!notification.is_read && user?.id) {
      try {
        await markNotificationAsRead(notification.id, user.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Failed to mark as read:', e);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const handleGoToChat = (notification) => {
    if (notification?.chat_id) {
      if (notification.type === 'queue_new') {
        navigate('/portal/queue', { state: { queueId: notification.chat_id } });
      } else {
        navigate('/portal/chats', { state: { chatId: notification.chat_id } });
      }
    }
    handleCloseModal();
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  return {
    // State
    selectedTab,
    loading,
    initialLoading,
    hasMore,
    unreadCount,
    isModalOpen,
    selectedNotification,
    dateFilter,
    typeFilters,
    // Derived
    filteredNotifications,
    groupedNotifications,
    groupKeys,
    // Setters
    setSelectedTab,
    setDateFilter,
    // Handlers
    toggleTypeFilter,
    handleNotificationClick,
    handleCloseModal,
    handleMarkAllAsRead,
    handleGoToChat,
    handleLoadMore,
  };
};

export default useNotifications;
