import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import { getQueue, getAvailableAgents, autoAssignChat, getChats } from '../api/chatApi';
import socketService from '../services/socketService';
import useAuth from './useAuth';
import { SOCKET_URL } from '../constants/constants';
import { withAlpha } from '../utils/colorUtils';
import { transformQueueData } from '../utils/queue/queueTransformers';

const useQueue = () => {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [queue, setQueue] = useState([]);
  const [activeChats, setActiveChats] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [availableAgents, setAvailableAgents] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [detailsTab, setDetailsTab] = useState('info');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // ── Derived ────────────────────────────────────────────────────────────────
  const selected = useMemo(() => queue.find((item) => item.id === selectedId), [queue, selectedId]);

  const statusCards = useMemo(
    () => [
      {
        id: 1,
        label: 'In Queue',
        value: queue.length,
        bg: withAlpha(palette.primary.lighter, 0.5),
        accent: palette.primary.main,
        border: withAlpha(palette.primary.main, 0.18),
      },
      {
        id: 2,
        label: 'Active Chats',
        value: activeChats,
        bg: withAlpha(palette.success.lighter, 0.5),
        accent: palette.success.main,
        border: withAlpha(palette.success.main, 0.18),
      },
      {
        id: 3,
        label: 'Resolved Today',
        value: resolvedToday,
        bg: withAlpha(palette.warning.lighter, 0.55),
        accent: palette.warning.main,
        border: withAlpha(palette.warning.main, 0.18),
      },
    ],
    [queue.length, activeChats, resolvedToday, palette]
  );

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      console.warn('User not logged in, redirecting to unauthorized page');
      navigate('/unauthorized-access');
    }
  }, [isLoggedIn, navigate]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchQueueData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [queueResponse, agentsResponse] = await Promise.all([
        getQueue(),
        getAvailableAgents(),
      ]);

      const transformedQueue = queueResponse.data.map(transformQueueData);
      setQueue(transformedQueue);
      setAvailableAgents(agentsResponse.data?.length || 0);

      try {
        const chatsResponse = await getChats(user.id);
        const activeChatsData = chatsResponse.data.filter((c) => c.status === 'active');
        setActiveChats(activeChatsData.length);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedTodayData = chatsResponse.data.filter((c) => {
          if (c.status !== 'ended') return false;
          const updatedDate = new Date(c.updated_at);
          updatedDate.setHours(0, 0, 0, 0);
          return updatedDate.getTime() === today.getTime();
        });
        setResolvedToday(resolvedTodayData.length);
      } catch (statsErr) {
        console.warn('Could not fetch chat stats:', statsErr.message);
      }

      if (transformedQueue.length > 0 && !selectedId) {
        setSelectedId(transformedQueue[0].id);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      setQueue([]);
      setActiveChats(0);
      setResolvedToday(0);
      setAvailableAgents(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedId]);

  useEffect(() => {
    if (!user?.id) return;
    fetchQueueData();
  }, [user?.id]);

  // ── Queue selection sync ───────────────────────────────────────────────────
  useEffect(() => {
    if (queue.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId == null || !queue.some((item) => item.id === selectedId)) {
      setSelectedId(queue[0].id);
    }
  }, [queue, selectedId]);

  // ── Navigate from location state ──────────────────────────────────────────
  useEffect(() => {
    if (!location.state?.queueId || queue.length === 0) return;
    const match = queue.find((q) => q.id === location.state.queueId);
    if (match) setSelectedId(match.id);
  }, [location.state, queue]);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const socket = socketService.connect(SOCKET_URL, user.id);

    const handleQueueUpdate = () => fetchQueueData();
    const handleNewMessage = () => fetchQueueData();
    const handleChatAssigned = () => fetchQueueData();

    socket.off('queue_update');
    socket.off('new_message');
    socket.off('chat_assigned');

    socket.on('queue_update', handleQueueUpdate);
    socket.on('new_message', handleNewMessage);
    socket.on('chat_assigned', handleChatAssigned);

    return () => {
      socket.off('queue_update', handleQueueUpdate);
      socket.off('new_message', handleNewMessage);
      socket.off('chat_assigned', handleChatAssigned);
    };
  }, [user?.id]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleViewMore = () => {
    if (queue.length === 0) return;
    setIsQueueModalOpen(true);
  };

  const handleCloseQueueModal = () => setIsQueueModalOpen(false);

  /**
   * Open chat handler - ALWAYS opens the first chat in queue (FIFO)
   * 
   * Queue prioritization is enforced on both frontend and backend:
   * - Frontend: Always sends the first chat in queue
   * - Backend: Always assigns the first chat in queue regardless of request
   * 
   * This ensures queue order is always respected and prevents agents
   * from cherry-picking chats out of order.
   */
  const handleOpenChat = async () => {
    if (queue.length === 0 || !user?.id) return;

    // ALWAYS open the first chat in queue (FIFO priority)
    const firstInQueue = queue[0];

    try {
      // Backend will validate and assign first in queue regardless of passed ID
      const response = await autoAssignChat(firstInQueue.id);

      // Use the chat_id returned from backend (ensures we navigate to correct chat)
      const assignedChatId = response.data?.chat_id || firstInQueue.id;

      setQueue((prev) => prev.filter((item) => item.id !== assignedChatId));
      setActiveChats((prev) => prev + 1);

      navigate('/portal/chats', {
        state: { chatId: assignedChatId, from: 'queue', customer: firstInQueue },
      });
    } catch (error) {
      console.error('Error opening chat:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to open chat';
      setSnackbar({ open: true, message: `Failed to open chat: ${errorMessage}`, severity: 'error' });
    }
  };

  const handleResolve = () => {
    if (!selected) return;
    setQueue((prev) => prev.filter((item) => item.id !== selected.id));
    setResolvedToday((prev) => prev + 1);
  };

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  return {
    // Theme
    palette,
    // State
    queue,
    selectedId,
    selected,
    detailsTab,
    isQueueModalOpen,
    loading,
    snackbar,
    availableAgents,
    // Derived
    statusCards,
    // Setters
    setSelectedId,
    setDetailsTab,
    // Handlers
    handleViewMore,
    handleCloseQueueModal,
    handleOpenChat,
    handleResolve,
    handleSnackbarClose,
    // User
    user,
  };
};

export default useQueue;
