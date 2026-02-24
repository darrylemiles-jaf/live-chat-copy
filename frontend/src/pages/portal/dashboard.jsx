import { Grid, Box, Typography, Badge, List, ListItem, ListItemText, ListItemAvatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, IconButton, Divider, Avatar, Drawer, TextField, FormControl, InputLabel, Select, MenuItem, Pagination, Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountClock, Close, MessageText } from 'mdi-material-ui';
import { Gauge } from '@mui/x-charts/Gauge';
import { LineChart } from '@mui/x-charts/LineChart';

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QueueDialog from '../../sections/queue/QueueDialog';
import MainCard from '../../components/MainCard';
import ScrollTop from '../../components/ScrollTop';
import PageHead from '../../components/PageHead';
import { withAlpha } from '../../utils/colorUtils';
import { useGetUsers } from '../../api/users';
import { getQueue, getChats, getChatStats } from '../../api/chatApi';
import { getCurrentUser } from '../../utils/auth';
import socketService from '../../services/socketService';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [rawAgentStatus, setRawAgentStatus] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [orgStats, setOrgStats] = useState({ days: [], newChats: [], closedChats: [], weeklyTotal: { new: 0, closed: 0 }, avgResponseTime: 0, avgResolutionTime: 0, activeChats: 0, queuedChats: 0, totalResolved: 0 });
  const [personalStats, setPersonalStats] = useState({ days: [], newChats: [], closedChats: [], weeklyTotal: { new: 0, closed: 0 }, avgResponseTime: 0, avgResolutionTime: 0, activeChats: 0, queuedChats: 0, totalResolved: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  const { users, usersLoading, usersError } = useGetUsers({ role: 'support' });

  useEffect(() => {
    if (users && users.length > 0) {
      const transformedAgents = users.map(user => {
        const name = user.name || user.username;
        const initials = name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
        return {
          id: user.id,
          name: name,
          status: user.status ? user.status.toLowerCase() : 'available',
          avatar: initials,
          profile_picture: user.profile_picture
        };
      });
      setRawAgentStatus(transformedAgents);
    }
  }, [users]);

  // Listen for real-time user status updates via socket
  useEffect(() => {
    const handleUserStatusChange = (data) => {
      console.log('📡 User status changed:', data);
      // Update the agent status in the list
      setRawAgentStatus(prevAgents =>
        prevAgents.map(agent =>
          agent.id === data.userId
            ? { ...agent, status: data.status }
            : agent
        )
      );
    };

    const socket = socketService.socket;
    if (socket) {
      socket.on('user_status_changed', handleUserStatusChange);
      console.log('👂 Dashboard: Listening for user status changes');
    }

    return () => {
      const s = socketService.socket;
      if (s) {
        s.off('user_status_changed', handleUserStatusChange);
      }
    };
  }, []);

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        setQueueLoading(true);
        const response = await getQueue(50);

        if (response.success && response.data) {
          const transformedQueue = response.data.map((chat) => {
            const client = chat.client || {};
            const lastMessage = chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].message_text
              : 'Waiting for response...';

            const waitTimeMs = chat.waiting_time || 0;
            const waitTimeSeconds = Math.floor(waitTimeMs / 1000);
            const minutes = Math.floor(waitTimeSeconds / 60);
            const seconds = waitTimeSeconds % 60;
            const waitTimeFormatted = `${minutes}m ${seconds}s`;

            let priority = 'Low';
            if (waitTimeSeconds > 600) priority = 'High';
            else if (waitTimeSeconds > 300) priority = 'Medium';

            return {
              id: chat.id,
              name: client.name || client.username || 'Unknown',
              email: client.email || 'N/A',
              lastMessage: lastMessage,
              waitTime: waitTimeFormatted,
              wait: waitTimeFormatted,
              topic: 'General Support',
              priority: priority,
              avatar: null,
              online: true
            };
          });

          setQueueData(transformedQueue);
        }
      } catch (error) {
        console.error('Error fetching queue data:', error);
        setQueueData([]);
      } finally {
        setQueueLoading(false);
      }
    };

    fetchQueueData();

    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        setChatsLoading(true);
        const currentUser = getCurrentUser();

        if (!currentUser || !currentUser.id) {
          console.error('No user logged in');
          setRecentChats([]);
          return;
        }

        const response = await getChats(currentUser.id);

        if (response.success && response.data) {
          const transformedChats = response.data.map((chat) => {
            const client = chat.client || {};
            const lastMessage = chat.last_message || chat.messages?.[chat.messages?.length - 1]?.message_text || 'No messages yet';

            const chatDate = new Date(chat.updated_at || chat.created_at);
            const now = new Date();
            const diffMs = now - chatDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeAgo = '';
            if (diffMins < 1) timeAgo = 'Just now';
            else if (diffMins < 60) timeAgo = `${diffMins}m`;
            else if (diffHours < 24) timeAgo = `${diffHours}h`;
            else timeAgo = `${diffDays}d`;

            const clientName = client.name || client.username || 'Unknown User';
            const initials = clientName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return {
              id: chat.id,
              name: clientName,
              message: lastMessage,
              time: timeAgo,
              avatar: initials,
              clientEmail: client.email
            };
          });

          setRecentChats(transformedChats);
        }
      } catch (error) {
        console.error('Error fetching recent chats:', error);
        setRecentChats([]);
      } finally {
        setChatsLoading(false);
      }
    };

    fetchRecentChats();

    // Refresh chats every 30 seconds
    const interval = setInterval(fetchRecentChats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const currentUser = getCurrentUser();

        // Fetch organization-wide stats
        const orgResponse = await getChatStats();
        if (orgResponse.success) {
          setOrgStats(orgResponse.data);
        }

        // Fetch personal stats if user is logged in
        if (currentUser && currentUser.id) {
          const personalResponse = await getChatStats(currentUser.id);
          if (personalResponse.success) {
            setPersonalStats(personalResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .replace(/\./g, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  };

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getAvatarBg = (palette, item) => {
    if (!palette) return undefined;
    if (item?.priority === 'High') return palette.error.main;
    if (item?.priority === 'Medium') return palette.warning.main;
    if (item?.priority === 'Low') return palette.success.main;
    return palette.primary.main;
  };


  const sortedAgentStatus = useMemo(() => {
    const avail = rawAgentStatus.filter((a) => a.status === 'available').sort((x, y) => x.name.localeCompare(y.name));
    const busy = rawAgentStatus.filter((a) => a.status === 'busy').sort((x, y) => x.name.localeCompare(y.name));
    const away = rawAgentStatus.filter((a) => a.status === 'away').sort((x, y) => x.name.localeCompare(y.name));
    const others = rawAgentStatus.filter((a) => !['available', 'busy', 'away'].includes(a.status)).sort((x, y) => x.name.localeCompare(y.name));
    const busyLimited = busy.slice(0, 10);
    return [...avail, ...busyLimited, ...away, ...others];
  }, [rawAgentStatus]);


  const [agentSearch, setAgentSearch] = useState('');
  const [agentStatusFilter, setAgentStatusFilter] = useState('all');
  const [agentPage, setAgentPage] = useState(1);
  const itemsPerPage = 5;
  const closeAgentDrawer = () => {
    setAgentDrawerOpen(false);
    setAgentSearch('');
    setAgentStatusFilter('all');
    setAgentPage(1);
  };

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

  return (
    <React.Fragment>
      <PageHead title='Dashboard' description='Timora Live Chat Overview' />
      <ScrollTop />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard sx={{ p: 2.5, height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Organization Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4653F2' }} />
                <Typography variant="caption">Requests</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                <Typography variant="caption">Resolved</Typography>
              </Box>
            </Box>
            <Box sx={{ width: '100%', height: 200 }}>
              <LineChart
                hideLegend
                height={200}
                grid={{ horizontal: true, vertical: false }}
                xAxis={[{ scaleType: 'point', data: orgStats.days, tickSize: 7, disableLine: true }]}
                yAxis={[{ tickSize: 7, disableLine: true }]}
                margin={{ left: 20, right: 20 }}
                series={[
                  { type: 'line', data: orgStats.newChats, label: 'Requests', id: 'requests', stroke: '#2196f3', strokeWidth: 2, showMark: true },
                  { type: 'line', data: orgStats.closedChats, label: 'Resolved', id: 'resolved', stroke: '#ff9800', strokeWidth: 2, showMark: true }
                ]}
                sx={{
                  '& .MuiChartsGrid-line': { strokeDasharray: '4 4', stroke: theme.vars.palette.divider },
                  '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{orgStats.weeklyTotal.new}</Typography>
                <Typography variant="body2" color="text.secondary">Requests (week)</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{orgStats.weeklyTotal.closed}</Typography>
                <Typography variant="body2" color="text.secondary">Resolved (week)</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{formatDuration(orgStats.avgResponseTime)}</Typography>
                <Typography variant="body2" color="text.secondary">Avg Response</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{formatDuration(orgStats.avgResolutionTime)}</Typography>
                <Typography variant="body2" color="text.secondary">Avg Resolution</Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard sx={{ p: 2.5, height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              My Performance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
                <Typography variant="caption">Requests</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                <Typography variant="caption">Resolved</Typography>
              </Box>
            </Box>
            <Box sx={{ width: '100%', height: 200 }}>
              <LineChart
                hideLegend
                height={200}
                grid={{ horizontal: true, vertical: false }}
                xAxis={[{ scaleType: 'point', data: personalStats.days, tickSize: 7, disableLine: true }]}
                yAxis={[{ tickSize: 7, disableLine: true }]}
                margin={{ left: 20, right: 20 }}
                series={[
                  { type: 'line', data: personalStats.newChats, label: 'Requests', id: 'requests', stroke: '#2196f3', strokeWidth: 2, showMark: true },
                  { type: 'line', data: personalStats.closedChats, label: 'Resolved', id: 'resolved', stroke: '#ff9800', strokeWidth: 2, showMark: true }
                ]}
                sx={{
                  '& .MuiChartsGrid-line': { strokeDasharray: '4 4', stroke: theme.vars.palette.divider },
                  '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{personalStats.weeklyTotal.new}</Typography>
                <Typography variant="body2" color="text.secondary">Requests (week)</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{personalStats.weeklyTotal.closed}</Typography>
                <Typography variant="body2" color="text.secondary">Resolved (week)</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{formatDuration(personalStats.avgResponseTime)}</Typography>
                <Typography variant="body2" color="text.secondary">Avg Response</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>{formatDuration(personalStats.avgResolutionTime)}</Typography>
                <Typography variant="body2" color="text.secondary">Avg Resolution</Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MainCard sx={{ p: 2.5, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Recent Chats
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/portal/chats')}
                sx={{ textTransform: 'none', color: '#008E86' }}
              >
                See more
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {chatsLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 200
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Loading chats...
                  </Typography>
                </Box>
              ) : recentChats.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 100,
                    textAlign: 'center',
                    px: 3,
                    gap: 1.5
                  }}
                >
                  <MessageText size={48} style={{ opacity: 0.3 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Recent Chats
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Your recent conversations will appear here
                    </Typography>
                  </Box>
                </Box>
              ) : (
                recentChats.map((chat, index) => {
                  const client = chat.client || {};
                  const initials = chat.avatar || '?';

                  return (
                    <ListItem
                      key={index}
                      onClick={() => navigate('/portal/chats')}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#008E86' }}>{initials}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={chat.name || 'Unknown Client'}
                        secondary={
                          <Box component="span">
                            {chat.message || '...'}
                            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
                              {chat.time || ''}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })
              )}
            </List>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
          <MainCard sx={{ p: 2.5, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Queue
              </Typography>
              <Button
                size="small"
                onClick={() => setQueueModalOpen(true)}
                sx={{ textTransform: 'none', color: '#008E86' }}
              >
                See more
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h2" fontWeight={500}>
                {queueData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In queue
              </Typography>
            </Box>
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {queueLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 200
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Loading queue...
                  </Typography>
                </Box>
              ) : queueData.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 50,
                    textAlign: 'center',
                    px: 3,
                    gap: 1.5
                  }}
                >
                  <AccountClock size={200} style={{ opacity: 0.3 }} />
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Chats in Queue
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      All chats are currently being handled
                    </Typography>
                  </Box>
                </Box>
              ) : (
                queueData.map((chat, index) => {
                  const client = chat.client || {};
                  const initials = client.name
                    ? client.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                    : '?';

                  return (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#008E86' }}>{initials}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={chat.name || 'Unknown Client'}
                        secondary={
                          <Box component="span">
                            Waiting for {chat.waitTime || '...'}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })
              )}
            </List>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MainCard sx={{ p: 2.5, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Agent status
              </Typography>
              <Button
                size="small"
                onClick={() => setAgentDrawerOpen(true)}
                sx={{ textTransform: 'none', color: '#008E86' }}
              >
                See more
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ overflow: 'auto', flex: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Loading agents...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : usersError ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="error">
                          Error loading agents
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : sortedAgentStatus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No agents available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedAgentStatus.slice(0, 8).map((agent, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell component="th" scope="row">{agent.name}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: agent.status === 'available' ? '#4caf50' : agent.status === 'busy' ? '#f44336' : agent.status === 'away' ? '#ffb300' : '#f44336',
                                flexShrink: 0
                              }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {agent.status}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      </Grid>

      <QueueDialog
        open={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        queue={queueData}
        selectedId={selectedQueueId}
        onSelect={setSelectedQueueId}
        palette={palette}
        withAlpha={withAlpha}
        getAvatarBg={getAvatarBg}
        getInitials={getInitials}
      />

      <Drawer
        anchor="right"
        open={agentDrawerOpen}
        onClose={closeAgentDrawer}
      >
        <Box sx={{ width: { xs: '100vw', sm: 400 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2.5, bgcolor: '#064856', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" color="inherit">
              Agent Status
            </Typography>
            <IconButton onClick={closeAgentDrawer} size="small" sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search agents"
              value={agentSearch}
              onChange={(e) => { setAgentSearch(e.target.value); setAgentPage(1); }}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="agent-status-filter-label">Status</InputLabel>
              <Select
                labelId="agent-status-filter-label"
                value={agentStatusFilter}
                label="Status"
                onChange={(e) => { setAgentStatusFilter(e.target.value); setAgentPage(1); }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
                <MenuItem value="away">Away</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <List sx={{ overflow: 'auto', p: 2.5, flex: 1 }}>
            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading agents...
                </Typography>
              </Box>
            ) : usersError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="error">
                  Error loading agents
                </Typography>
              </Box>
            ) : displayedAgents.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography variant="body2" color="text.secondary">
                  No agents found
                </Typography>
              </Box>
            ) : (
              displayedAgents.map((agent, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: '#008E86',
                      width: 40,
                      height: 40,
                      mr: 2,
                      flexShrink: 0
                    }}
                  >
                    {agent.avatar}
                  </Avatar>
                  <ListItemText
                    primary={agent.name}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: agent.status === 'available' ? '#4caf50' : agent.status === 'busy' ? '#f44336' : agent.status === 'away' ? '#ffb300' : '#f44336',
                        flexShrink: 0
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {agent.status}
                    </Typography>
                  </Box>
                </ListItem>
              )))}
          </List>

          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={agentPage}
              onChange={(_, value) => setAgentPage(value)}
              size="small"
              color="primary"
            />
          </Box>
        </Box>
      </Drawer>
    </React.Fragment>
  );
};

export default Dashboard;
