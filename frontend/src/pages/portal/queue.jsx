import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Grid, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

import { withAlpha } from '../../utils/colorUtils';
import { SOCKET_URL } from '../../constants/constants';
import { getQueue, getAvailableAgents, autoAssignChat, getChats } from '../../api/chatApi';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import QueueDialog from '../../sections/queue/QueueDialog';
import QueueHeader from '../../sections/queue/QueueHeader';
import WaitingQueueSection from '../../sections/queue/WaitingQueueSection';
import CustomerDetailsSection from '../../sections/queue/CustomerDetailsSection';
import CurrentStatusSection from '../../sections/queue/CurrentStatusSection';
import socketService from '../../services/socketService';
import PageHead from '../../components/PageHead';

import useAuth from '../../hooks/useAuth';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Queue' }];

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
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  const [queue, setQueue] = useState([]);
  const [activeChats, setActiveChats] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [availableAgents, setAvailableAgents] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [detailsTab, setDetailsTab] = useState('info');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const selected = useMemo(() => queue.find((item) => item.id === selectedId), [queue, selectedId]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.warn('User not logged in, redirecting to login');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const fetchQueueData = useCallback(async () => {
    if (!user?.id) {
      console.warn('No user ID available');
      return;
    }

    try {
      setLoading(true);
      const [queueResponse, agentsResponse] = await Promise.all([
        getQueue(),
        getAvailableAgents()
      ]);

      const transformedQueue = queueResponse.data.map(transformQueueData);
      setQueue(transformedQueue);

      setAvailableAgents(agentsResponse.data?.length || 0);

      try {
        const chatsResponse = await getChats(user.id);
        const activeChatsData = chatsResponse.data.filter(chat => chat.status === 'active');
        setActiveChats(activeChatsData.length);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedTodayData = chatsResponse.data.filter(chat => {
          if (chat.status !== 'ended') return false;
          const updatedDate = new Date(chat.updated_at);
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
  useEffect(() => {
    if (!location.state?.queueId) return;
    if (queue.length === 0) return; // wait for queue to load
    const match = queue.find((q) => q.id === location.state.queueId);
    if (match) setSelectedId(match.id);
  }, [location.state, queue]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = socketService.connect(SOCKET_URL, user.id);

    const handleQueueUpdate = (data) => {
      console.log('📢 Queue update received:', data);
      fetchQueueData();
    };

    const handleNewMessage = (message) => {
      console.log('📨 New message in queue:', message);
      fetchQueueData();
    };

    const handleChatAssigned = (chatData) => {
      console.log('✅ Chat assigned:', chatData);
      fetchQueueData();
    };

    socket.off('queue_update');
    socket.off('new_message');
    socket.off('chat_assigned');

    socket.on('queue_update', handleQueueUpdate);
    socket.on('new_message', handleNewMessage);
    socket.on('chat_assigned', handleChatAssigned);

    console.log('🔌 Queue page: Socket handlers registered, connected:', socket.connected);

    return () => {
      socket.off('queue_update', handleQueueUpdate);
      socket.off('new_message', handleNewMessage);
      socket.off('chat_assigned', handleChatAssigned);
    };
  }, [user?.id]);
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

    console.log('🎯 Accepting chat:', selected.id, 'for agent:', user.id);

    try {
      const result = await autoAssignChat(selected.id);
      console.log('✅ Chat accepted:', result);

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
      setSnackbar({ open: true, message: `Failed to open chat: ${errorMessage}`, severity: 'error' });
    }
  };

  const handleResolve = () => {
    if (!selected) return;

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
      <PageHead title='Queue' description='Timora Live Chat Queue Overview' />
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
                isFirst={queue.length > 0 && queue[0]?.id === selectedId}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default Queue;
