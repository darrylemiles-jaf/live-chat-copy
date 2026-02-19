import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { withAlpha } from '../../utils/colorUtils';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import QueueDialog from '../../sections/queue/QueueDialog';
import QueueHeader from '../../sections/queue/QueueHeader';
import HistoryQueueSection from '../../sections/queue/HistoryQueueSection';
import WaitingQueueSection from '../../sections/queue/WaitingQueueSection';
import CustomerDetailsSection from '../../sections/queue/CustomerDetailsSection';
import CurrentStatusSection from '../../sections/queue/CurrentStatusSection';
import { getQueue, getAvailableAgents, autoAssignChat, getChats } from '../../api/chatApi';
import socketService from '../../services/socketService';
import useAuth from '../../hooks/useAuth';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Queue' }];

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

// Helper functions
function getInitials(name) {
  if (!name) return '?';
  return name
    .replace(/\./g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getAvatarBg(palette, item) {
  if (!palette) return undefined;

  if (item?.priority === 'High') return palette.error.main;
  if (item?.priority === 'Medium') return palette.warning.main;
  if (item?.priority === 'Low') return palette.success.main;
  return palette.primary.main;
}

function formatWaitTime(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `Waiting ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  return `Waiting ${diffHours}h ${diffMins % 60}m`;
}

function transformQueueData(item) {
  return {
    id: item.id,
    name: item.client?.name || 'Unknown',
    wait: formatWaitTime(item.created_at),
    email: item.client?.email || 'N/A',
    lastMessage: item.messages?.[item.messages.length - 1]?.message || 'No messages',
    priority: item.waiting_time > 600000 ? 'High' : item.waiting_time > 300000 ? 'Medium' : 'Low',
    avatar: `/src/assets/images/users/avatar-${(item.id % 8) + 1}.png`,
    online: true,
    orderId: `#${item.id}`,
    status: 'In Queue',
    issue: item.messages?.[0]?.message || 'No issue description',
    notes: `Customer has been waiting ${formatWaitTime(item.created_at)}`,
    client_id: item.client_id,
    agent_id: item.agent_id,
    created_at: item.created_at,
    messages: item.messages || []
  };
}

// ==============================|| MAIN QUEUE COMPONENT ||============================== //

const Queue = () => {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [queue, setQueue] = useState([]);
  const [historyQueue, setHistoryQueue] = useState([]);
  const [activeChats, setActiveChats] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [availableAgents, setAvailableAgents] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [detailsTab, setDetailsTab] = useState('info');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const selected = useMemo(() => queue.find((item) => item.id === selectedId), [queue, selectedId]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.warn('User not logged in, redirecting to login');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch queue data
  const fetchQueueData = async () => {
    if (!user?.id) {
      console.warn('No user ID available');
      return;
    }

    try {
      setLoading(true);
      const [queueResponse, chatsResponse, agentsResponse] = await Promise.all([
        getQueue(),
        getChats(user.id),
        getAvailableAgents()
      ]);

      // Transform the queue data
      const transformedQueue = queueResponse.data.map(transformQueueData);
      setQueue(transformedQueue);

      // Calculate active chats (chats with status 'active')
      const activeChatsData = chatsResponse.data.filter(chat => chat.status === 'active');
      setActiveChats(activeChatsData.length);

      // Calculate resolved today (chats with status 'closed' and updated today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const resolvedTodayData = chatsResponse.data.filter(chat => {
        if (chat.status !== 'closed') return false;
        const updatedDate = new Date(chat.updated_at);
        updatedDate.setHours(0, 0, 0, 0);
        return updatedDate.getTime() === today.getTime();
      });
      setResolvedToday(resolvedTodayData.length);

      // Set available agents count
      setAvailableAgents(agentsResponse.data?.length || 0);

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
  };

  // Initialize: fetch data and connect socket
  useEffect(() => {
    if (!user?.id) return;

    fetchQueueData();

    // Connect to WebSocket
    const socket = socketService.connect(SOCKET_URL, user.id);

    // Listen for queue updates
    socket.on('queue_update', (data) => {
      console.log('Queue update received:', data);
      fetchQueueData(); // Refresh queue on update
    });

    // Listen for new messages
    socket.on('new_message', (message) => {
      console.log('New message in queue:', message);
      fetchQueueData(); // Refresh to show updated messages
    });

    // Listen for chat assignments
    socket.on('chat_assigned', (chatData) => {
      console.log('Chat assigned:', chatData);
      fetchQueueData(); // Refresh queue
    });

    return () => {
      socket.off('queue_update');
      socket.off('new_message');
      socket.off('chat_assigned');
    };
  }, [user?.id]);

  // Auto-select first item when queue changes
  useEffect(() => {
    if (queue.length === 0) {
      setSelectedId(null);
      return;
    }

    if (selectedId == null || !queue.some((item) => item.id === selectedId)) {
      setSelectedId(queue[0].id);
    }
  }, [queue, selectedId]);

  const statusCards = useMemo(
    () => [
      {
        id: 1,
        label: 'In Queue',
        value: queue.length,
        bg: withAlpha(palette.primary.lighter, 0.5),
        accent: palette.primary.main,
        border: withAlpha(palette.primary.main, 0.18)
      },
      {
        id: 2,
        label: 'Active Chats',
        value: activeChats,
        bg: withAlpha(palette.success.lighter, 0.5),
        accent: palette.success.main,
        border: withAlpha(palette.success.main, 0.18)
      },
      {
        id: 3,
        label: 'Resolved Today',
        value: resolvedToday,
        bg: withAlpha(palette.warning.lighter, 0.55),
        accent: palette.warning.main,
        border: withAlpha(palette.warning.main, 0.18)
      }
    ],
    [queue.length, activeChats, resolvedToday, palette]
  );

  const handleViewMore = () => {
    if (queue.length === 0) return;
    setIsQueueModalOpen(true);
  };

  const handleCloseQueueModal = () => {
    setIsQueueModalOpen(false);
  };

  const handleOpenChat = async () => {
    if (!selected || !user?.id) {
      console.error('❌ Cannot open chat: missing selected or user', { selected, user });
      return;
    }

    console.log('🎯 Opening chat:', selected.id, 'for user:', user.id);

    try {
      // Auto-assign the chat to current agent
      const result = await autoAssignChat(selected.id);
      console.log('✅ Chat assigned:', result);

      // Remove from queue and navigate to chats
      setQueue((prev) => prev.filter((item) => item.id !== selected.id));
      setActiveChats((prev) => prev + 1);

      navigate('/portal/chats', {
        state: {
          chatId: selected.id,
          from: 'queue',
          customer: selected
        }
      });
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to open chat';
      alert(`Failed to open chat: ${errorMessage}`);
    }
  };

  const handleResolve = () => {
    if (!selected) return;

    // Move to history and remove from queue
    setHistoryQueue((prev) => [
      {
        ...selected,
        wait: 'Done',
        status: 'Done'
      },
      ...prev
    ]);
    setQueue((prev) => prev.filter((item) => item.id !== selected.id));
    setResolvedToday((prev) => prev + 1);
  };

  if (loading) {
    return (
      <React.Fragment>
        <Breadcrumbs heading="Queue" links={breadcrumbLinks} subheading="View and manage your chat queue here." />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Breadcrumbs heading="Queue" links={breadcrumbLinks} subheading="View and manage your chat queue here." />

      <Box sx={{ mt: 2, borderRadius: 1, border: `1px solid ${palette.divider}` }}>
        <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1, p: { xs: 2, md: 3 }, boxShadow: 'none' }}>
          <QueueHeader palette={palette} availableAgents={availableAgents} />

          <Grid container spacing={2.5} size={12} alignItems="stretch" sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, md: 3.5 }}>
              <CustomerDetailsSection
                palette={palette}
                selected={selected}
                detailsTab={detailsTab}
                setDetailsTab={setDetailsTab}
                handleOpenChat={handleOpenChat}
                handleResolve={handleResolve}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <WaitingQueueSection
                palette={palette}
                queue={queue}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onViewMore={handleViewMore}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2.5 }}>
              <CurrentStatusSection palette={palette} statusCards={statusCards} />
            </Grid>
            <Grid size={12}>
              <HistoryQueueSection palette={palette} history={historyQueue} />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <QueueDialog
        open={isQueueModalOpen}
        onClose={handleCloseQueueModal}
        queue={queue}
        selectedId={selectedId}
        onSelect={setSelectedId}
        palette={palette}
        withAlpha={withAlpha}
        getAvatarBg={getAvatarBg}
        getInitials={getInitials}
      />
    </React.Fragment>
  );
};

export default Queue;
