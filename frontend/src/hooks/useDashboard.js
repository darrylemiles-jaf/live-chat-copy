import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { useGetUsers } from '../api/users';
import { getQueue, getChats, getChatStats } from '../api/chatApi';
import { getCurrentUser } from '../utils/auth';
import socketService from '../services/socketService';
import {
  transformAgentStatus,
  transformQueueItem,
  transformRecentChat,
  getInitials,
  formatDuration,
  getAvatarBg
} from '../utils/dashboard/dashboardTransformers';

const EMPTY_STATS = {
  days: [],
  newChats: [],
  closedChats: [],
  weeklyTotal: { new: 0, closed: 0 },
  avgResponseTime: 0,
  avgResolutionTime: 0,
  activeChats: 0,
  queuedChats: 0,
  totalResolved: 0
};

export const useDashboard = () => {
  const theme = useTheme();
  const { palette } = theme;

  // ---- state ----
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [rawAgentStatus, setRawAgentStatus] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [orgStats, setOrgStats] = useState(EMPTY_STATS);
  const [personalStats, setPersonalStats] = useState(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(false);
  const [agentSearch, setAgentSearch] = useState('');
  const [agentStatusFilter, setAgentStatusFilter] = useState('all');
  const [agentPage, setAgentPage] = useState(1);
  const itemsPerPage = 5;

  const { users, usersLoading, usersError } = useGetUsers({ role: 'support' });

  // Populate agents from API
  useEffect(() => {
    if (users && users.length > 0) {
      setRawAgentStatus(users.map(transformAgentStatus));
    }
  }, [users]);

  // Socket – live agent status updates
  useEffect(() => {
    const handleUserStatusChange = (data) => {
      setRawAgentStatus((prev) =>
        prev.map((agent) =>
          agent.id === data.userId ? { ...agent, status: data.status } : agent
        )
      );
    };

    const socket = socketService.socket;
    if (socket) {
      socket.on('user_status_changed', handleUserStatusChange);
    }

    return () => {
      const s = socketService.socket;
      if (s) s.off('user_status_changed', handleUserStatusChange);
    };
  }, []);

  // Queue – fetch + socket refresh
  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        setQueueLoading(true);
        const response = await getQueue(50);
        if (response.success && response.data) {
          setQueueData(response.data.map(transformQueueItem));
        }
      } catch {
        setQueueData([]);
      } finally {
        setQueueLoading(false);
      }
    };

    fetchQueueData();

    let attached = false;
    const handler = () => fetchQueueData();
    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) {
        s.on('queue_update', handler);
        s.on('chat_assigned', handler);
        attached = true;
      }
    };
    tryAttach();
    const retry = setInterval(() => { if (attached) { clearInterval(retry); return; } tryAttach(); }, 500);

    return () => {
      clearInterval(retry);
      const s = socketService.socket;
      if (s && attached) {
        s.off('queue_update', handler);
        s.off('chat_assigned', handler);
      }
    };
  }, []);

  // Recent chats – fetch + 30 s refresh
  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        setChatsLoading(true);
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) { setRecentChats([]); return; }
        const response = await getChats(currentUser.id);
        if (response.success && response.data) {
          setRecentChats(response.data.map(transformRecentChat));
        }
      } catch {
        setRecentChats([]);
      } finally {
        setChatsLoading(false);
      }
    };

    fetchRecentChats();
    const interval = setInterval(fetchRecentChats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stats – fetch + 5 min refresh
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const currentUser = getCurrentUser();

        const orgResponse = await getChatStats();
        if (orgResponse.success) setOrgStats(orgResponse.data);

        if (currentUser && currentUser.id) {
          const personalResponse = await getChatStats(currentUser.id);
          if (personalResponse.success) setPersonalStats(personalResponse.data);
        }
      } catch {
        // keep previous stats
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  // ---- handlers ----
  const closeAgentDrawer = useCallback(() => {
    setAgentDrawerOpen(false);
    setAgentSearch('');
    setAgentStatusFilter('all');
    setAgentPage(1);
  }, []);

  // ---- derived state ----
  const sortedAgentStatus = useMemo(() => {
    const avail = rawAgentStatus.filter((a) => a.status === 'available').sort((x, y) => x.name.localeCompare(y.name));
    const busy = rawAgentStatus.filter((a) => a.status === 'busy').sort((x, y) => x.name.localeCompare(y.name)).slice(0, 10);
    const away = rawAgentStatus.filter((a) => a.status === 'away').sort((x, y) => x.name.localeCompare(y.name));
    const others = rawAgentStatus.filter((a) => !['available', 'busy', 'away'].includes(a.status)).sort((x, y) => x.name.localeCompare(y.name));
    return [...avail, ...busy, ...away, ...others];
  }, [rawAgentStatus]);

  const filteredSortedAgents = useMemo(() => {
    let list = [...rawAgentStatus];

    if (!agentSearch && (!agentStatusFilter || agentStatusFilter === 'all')) {
      const avail = list.filter((a) => a.status === 'available');
      const busy = list.filter((a) => a.status === 'busy');
      const away = list.filter((a) => a.status === 'away');
      const others = list.filter((a) => !['available', 'busy', 'away'].includes(a.status));
      return [...avail, ...busy, ...away, ...others];
    }

    if (agentSearch) {
      const q = agentSearch.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }

    if (agentStatusFilter && agentStatusFilter !== 'all') {
      list = list.filter((a) => a.status === agentStatusFilter);
    }

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [rawAgentStatus, agentStatusFilter, agentSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedAgents.length / itemsPerPage));
  const displayedAgents = filteredSortedAgents.slice((agentPage - 1) * itemsPerPage, agentPage * itemsPerPage);

  return {
    // theme
    theme,
    palette,
    // state
    queueModalOpen, setQueueModalOpen,
    agentDrawerOpen, setAgentDrawerOpen,
    selectedQueueId, setSelectedQueueId,
    queueData,
    queueLoading,
    recentChats,
    chatsLoading,
    orgStats,
    personalStats,
    statsLoading,
    agentSearch, setAgentSearch,
    agentStatusFilter, setAgentStatusFilter,
    agentPage, setAgentPage,
    itemsPerPage,
    // api
    usersLoading,
    usersError,
    // derived
    sortedAgentStatus,
    filteredSortedAgents,
    displayedAgents,
    totalPages,
    // handlers
    closeAgentDrawer,
    // helpers (used by sub-components / QueueDialog)
    getInitials,
    formatDuration,
    getAvatarBg
  };
};
