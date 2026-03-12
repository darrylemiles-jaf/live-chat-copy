import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser } from 'utils/auth';
import { getNotifications, getQueue, getChats, getChatMessages } from 'api/chatApi';
import socketService from 'services/socketService';
import { SOCKET_URL } from 'constants/constants';
import { useSnackbar } from 'contexts/SnackbarContext';
import router from 'routes';

const NotificationBadgeContext = createContext({
  bellCount: 0,
  chatBadgeCount: 0,
  queueBadgeCount: 0,
  decrementBell: () => { },
  resetChatBadge: () => { },
  resetQueueBadge: () => { },
  resetAll: () => { },
});

export const NotificationBadgeProvider = ({ children }) => {
  const { showSnackbar } = useSnackbar();
  const [bellCount, setBellCount] = useState(0);
  const [chatBadgeCount, setChatBadgeCount] = useState(0);
  const [queueBadgeCount, setQueueBadgeCount] = useState(0);
  const trackedUnreadIdsRef = useRef(new Set());

  // Real-time tracking — updated by socket events, no API call needed per message
  // Map<chatId, unseenCount> — counts unseen client messages per chat
  const unreadChatCountsRef = useRef(new Map());
  const agentChatIdsRef = useRef(new Set()); // active chats currently assigned to this agent
  const queuedChatIdsRef = useRef(new Set()); // chat IDs currently in the queue
  // Counts that were cleared by resetChatBadge — syncChatBadge subtracts these so
  // old unread messages don't reappear after the agent visits the inbox.
  const acknowledgedBaselineRef = useRef(new Map());
  // Deduplicates new_message events: the server emits to both the chat room and
  // the agent's personal room, so the same message can arrive twice.
  const seenMessageIdsRef = useRef(new Set());

  // Reactive user ID — initialised from localStorage on mount. If the user has not
  // yet logged in (provider mounts before auth), we poll until the token appears so
  // that badge counts and the socket connection are set up automatically after a
  // client-side login without requiring a full page refresh.
  const [userId, setUserId] = useState(() => getCurrentUser()?.id ?? null);

  useEffect(() => {
    if (userId) return;
    const timer = setInterval(() => {
      const id = getCurrentUser()?.id;
      if (id) setUserId(id);
    }, 200);
    return () => clearInterval(timer);
  }, [userId]);

  // Fetch ground-truth queue count from server.
  // Called on initial load, reconnect, and when in doubt.
  const syncQueueCount = useCallback(async () => {
    try {
      const res = await getQueue(200);
      const items = Array.isArray(res) ? res : res?.data || [];
      queuedChatIdsRef.current = new Set(items.map((i) => Number(i.id)));
      setQueueBadgeCount(items.length);
    } catch (_) { }
  }, []);

  // Fetch ground-truth from server — rebuilds both tracking sets and updates badge.
  // Called on initial load, on reconnect, and when chat assignments change.
  const syncChatBadge = useCallback(async () => {
    const uid = getCurrentUser()?.id;
    if (!uid) return;
    try {
      const res = await getChats(uid);
      const chats = Array.isArray(res) ? res : res?.data || [];

      agentChatIdsRef.current = new Set(
        chats
          .filter((c) => c.agent_id == uid && c.status === 'active')
          .map((c) => Number(c.id))
      );

      const unreadMap = new Map();
      chats.forEach((chat) => {
        if (chat.agent_id != uid || chat.status !== 'active') return;
        const count = (chat.messages || []).filter(
          (m) => m.sender_role === 'client' && !m.is_seen
        ).length;
        if (count > 0) unreadMap.set(Number(chat.id), count);
      });
      // Subtract acknowledged baseline: don't restore counts the agent already dismissed
      const adjustedMap = new Map();
      unreadMap.forEach((count, chatId) => {
        const acked = acknowledgedBaselineRef.current.get(chatId) || 0;
        const net = Math.max(0, count - acked);
        if (net > 0) adjustedMap.set(chatId, net);
      });
      unreadChatCountsRef.current = adjustedMap;
      const total = [...adjustedMap.values()].reduce((a, b) => a + b, 0);
      setChatBadgeCount(total);
    } catch (_) { }
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!userId) return;
      try {
        const result = await getNotifications(userId, 1, 100);
        if (result?.success) {
          setBellCount(result.unread_count || 0);
          result.data.filter((n) => !n.is_read).forEach((n) => trackedUnreadIdsRef.current.add(n.id));
        }
      } catch (_) { }
    };
    fetchCounts();
    syncChatBadge();
    syncQueueCount();
  }, [userId, syncChatBadge, syncQueueCount]);

  useEffect(() => {
    const handleNotification = (notification) => {
      if (notification.is_read) return;
      if (trackedUnreadIdsRef.current.has(notification.id)) return;
      trackedUnreadIdsRef.current.add(notification.id);
      setBellCount((c) => c + 1);
    };

    // New client message → +1 for that chat in real time
    const handleNewMessage = (msg) => {
      if (msg.sender_role !== 'client') return;
      // The server emits new_message to both the chat room and the agent's personal
      // room, so deduplicate by message ID to avoid counting the same message twice.
      if (msg.id) {
        if (seenMessageIdsRef.current.has(msg.id)) return;
        seenMessageIdsRef.current.add(msg.id);
        // Keep the set bounded to avoid unbounded memory growth
        if (seenMessageIdsRef.current.size > 200) {
          const [oldest] = seenMessageIdsRef.current;
          seenMessageIdsRef.current.delete(oldest);
        }
      }
      const chatId = Number(msg.chat_id);
      if (agentChatIdsRef.current.has(chatId)) {
        const prev = unreadChatCountsRef.current.get(chatId) || 0;
        unreadChatCountsRef.current.set(chatId, prev + 1);
        setChatBadgeCount((c) => c + 1);
      }
    };

    // Agent read a chat → subtract that chat's unseen count in real time
    const handleMessagesSeen = ({ chatId }) => {
      const cid = Number(chatId);
      const count = unreadChatCountsRef.current.get(cid) || 0;
      if (count > 0) {
        unreadChatCountsRef.current.delete(cid);
        setChatBadgeCount((c) => Math.max(0, c - count));
      }
      // Messages were actually read — remove from baseline so future syncs reflect reality
      acknowledgedBaselineRef.current.delete(cid);
    };

    // Chat newly assigned → update tracking sets in real-time, fetch only that chat's messages
    const handleChatAssigned = async (chatData) => {
      const uid = getCurrentUser()?.id;
      const chatId = Number(chatData?.id);
      if (!chatId) return;

      // Remove from queue set (it's no longer queued)
      if (queuedChatIdsRef.current.has(chatId)) {
        queuedChatIdsRef.current.delete(chatId);
        setQueueBadgeCount(queuedChatIdsRef.current.size);
      }

      if (chatData.agent_id == uid) {
        agentChatIdsRef.current.add(chatId);
        const clientName = chatData.client_name || chatData.name || 'A client';
        showSnackbar(`${clientName} has been assigned to you`, 'info', {
          title: 'New Chat Assigned',
          duration: 6000,
          onClick: () => router.navigate('/portal/chats', { state: { chatId: chatId } }),
        });
        try {
          const res = await getChatMessages(chatId);
          const msgs = Array.isArray(res) ? res : res?.data || [];
          const unread = msgs.filter(
            (m) => m.sender_role === 'client' && !m.is_seen
          ).length;
          if (unread > 0) {
            unreadChatCountsRef.current.set(chatId, unread);
            setChatBadgeCount((c) => c + unread);
          }
        } catch (_) { }
      } else {
        // Assigned to another agent — remove from my sets if it was there
        agentChatIdsRef.current.delete(chatId);
        acknowledgedBaselineRef.current.delete(chatId);
        const count = unreadChatCountsRef.current.get(chatId) || 0;
        if (count > 0) {
          unreadChatCountsRef.current.delete(chatId);
          setChatBadgeCount((c) => Math.max(0, c - count));
        }
      }
    };

    const handleChatStatusUpdate = ({ chatId, status }) => {
      if (status === 'ended') {
        const cid = Number(chatId);
        agentChatIdsRef.current.delete(cid);
        acknowledgedBaselineRef.current.delete(cid);
        const count = unreadChatCountsRef.current.get(cid) || 0;
        unreadChatCountsRef.current.delete(cid);
        if (count > 0) setChatBadgeCount((c) => Math.max(0, c - count));
        // ended chat may have been queued
        if (queuedChatIdsRef.current.has(cid)) {
          queuedChatIdsRef.current.delete(cid);
          setQueueBadgeCount(queuedChatIdsRef.current.size);
        }
      }
    };

    // Real-time queue badge — no API call, driven purely by action type
    const handleQueueUpdate = ({ action, chatId }) => {
      const cid = Number(chatId);
      if (action === 'new_chat' || action === 'new_chat_queued') {
        if (!queuedChatIdsRef.current.has(cid)) {
          queuedChatIdsRef.current.add(cid);
          setQueueBadgeCount(queuedChatIdsRef.current.size);
        }
      } else if (action === 'chat_assigned') {
        if (queuedChatIdsRef.current.has(cid)) {
          queuedChatIdsRef.current.delete(cid);
          setQueueBadgeCount(queuedChatIdsRef.current.size);
        }
        // chat_assigned socket event already handles the chat badge in real-time
      } else if (action === 'chat_ended') {
        if (queuedChatIdsRef.current.has(cid)) {
          queuedChatIdsRef.current.delete(cid);
          setQueueBadgeCount(queuedChatIdsRef.current.size);
        }
      } else {
        // Unknown action — fall back to API sync
        syncQueueCount();
      }
    };

    const uid = userId;
    if (!uid || !SOCKET_URL) return;

    const socket = socketService.connect(SOCKET_URL, uid);

    socket.on('new_notification', handleNotification);
    socket.on('new_message', handleNewMessage);
    socket.on('messages_seen', handleMessagesSeen);
    socket.on('chat_assigned', handleChatAssigned);
    socket.on('chat_status_update', handleChatStatusUpdate);
    socket.on('queue_update', handleQueueUpdate);

    // Re-sync counts whenever the socket (re)connects so badges stay accurate
    // after a network interruption.
    const handleReconnect = () => {
      syncChatBadge();
      syncQueueCount();
    };
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('new_notification', handleNotification);
      socket.off('new_message', handleNewMessage);
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('chat_assigned', handleChatAssigned);
      socket.off('chat_status_update', handleChatStatusUpdate);
      socket.off('queue_update', handleQueueUpdate);
      socket.off('connect', handleReconnect);
    };
  }, [userId, syncQueueCount, syncChatBadge]);

  const decrementBell = useCallback((notification) => {
    if (!notification) return;
    if (trackedUnreadIdsRef.current.has(notification.id)) {
      trackedUnreadIdsRef.current.delete(notification.id);
      setBellCount((c) => Math.max(0, c - 1));
    }
  }, []);

  const resetChatBadge = useCallback(() => {
    // Save current counts as the acknowledged baseline before clearing.
    // syncChatBadge will subtract these so old unreads don't reappear after
    // the agent visits the inbox without actually reading every chat.
    acknowledgedBaselineRef.current = new Map(unreadChatCountsRef.current);
    setChatBadgeCount(0);
    unreadChatCountsRef.current.clear();
  }, []);

  const resetQueueBadge = useCallback(() => {
    setQueueBadgeCount(0);
    queuedChatIdsRef.current.clear();
  }, []);

  const resetAll = useCallback(() => {
    trackedUnreadIdsRef.current.clear();
    unreadChatCountsRef.current.clear();
    agentChatIdsRef.current.clear();
    queuedChatIdsRef.current.clear();
    acknowledgedBaselineRef.current.clear();
    setBellCount(0);
    setChatBadgeCount(0);
    setQueueBadgeCount(0);
  }, []);

  return (
    <NotificationBadgeContext.Provider value={{ bellCount, chatBadgeCount, queueBadgeCount, decrementBell, resetChatBadge, resetQueueBadge, resetAll }}>
      {children}
    </NotificationBadgeContext.Provider>
  );
};

export const useNotificationBadge = () => useContext(NotificationBadgeContext);
