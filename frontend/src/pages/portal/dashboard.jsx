import { Grid, Box, Typography, Badge, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, IconButton, Divider, Avatar, Drawer, TextField, FormControl, InputLabel, Select, MenuItem, Pagination } from '@mui/material';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [rawAgentStatus, setRawAgentStatus] = useState([]);
  
  // Fetch support agents from the database
  const { users, usersLoading, usersError } = useGetUsers({ role: 'support' });
  
  // Update agents when users data changes
  useEffect(() => {
    if (users && users.length > 0) {
      const transformedAgents = users.map(user => {
        const name = user.name || user.username;
        const initials = name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
        return {
          name: name,
          status: user.status ? user.status.toLowerCase() : 'available',
          avatar: initials,
          profile_picture: user.profile_picture
        };
      });
      setRawAgentStatus(transformedAgents);
    }
  }, [users]);

  
  const recentChats = [
    { id: 1, name: 'Meow', message: 'Messages and calls are secured with end-to-end encr...', time: '6m', avatar: 'BA' },
    { id: 2, name: 'Dave Spencer Sanchez Bacay', message: 'You: san na', time: '6m', avatar: 'DS' },
    { id: 3, name: '"Carry On" Basketball Club', message: 'Kuya Rupert: Kapag puno dun ka naglilista gol...', time: '8m', avatar: 'CO' },
    { id: 4, name: 'Shannon Paul Navarro Giron', message: 'Shannon Paul missed your call', time: '1h', avatar: 'SN' },
    { id: 5, name: 'Godofredo Bitoon Perez III', message: 'Messages and calls are secured with end-to-end encry...', time: '2h', avatar: 'GP' },
    { id: 6, name: 'Armelo Bacay', message: 'Messages and calls are secured with end-to-end e...', time: '2h', avatar: 'AB' }
  ];

  const queueData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      lastMessage: 'Waiting for an agent response.',
      waitTime: '2m 15s',
      wait: '2m 15s',
      topic: 'Technical Support',
      priority: 'High',
      avatar: '/src/assets/images/users/avatar-1.png',
      online: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      lastMessage: 'Billing question about last invoice.',
      waitTime: '4m 30s',
      wait: '4m 30s',
      topic: 'Billing Question',
      priority: 'Medium',
      avatar: '/src/assets/images/users/avatar-2.png',
      online: true
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      lastMessage: 'Asking about product availability.',
      waitTime: '5m 45s',
      wait: '5m 45s',
      topic: 'Product Inquiry',
      priority: 'Low',
      avatar: '/src/assets/images/users/avatar-3.png',
      online: false
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.k@email.com',
      lastMessage: 'Account access issue on login.',
      waitTime: '7m 20s',
      wait: '7m 20s',
      topic: 'Account Issue',
      priority: 'High',
      avatar: '/src/assets/images/users/avatar-4.png',
      online: true
    },
    {
      id: 5,
      name: 'Jessica Martinez',
      email: 'jessica.m@email.com',
      lastMessage: 'General support request.',
      waitTime: '8m 10s',
      wait: '8m 10s',
      topic: 'General Support',
      priority: 'Medium',
      avatar: '/src/assets/images/users/avatar-5.png',
      online: true
    },
    {
      id: 6,
      name: 'James Wilson',
      email: 'james.w@email.com',
      lastMessage: 'Technical support needed.',
      waitTime: '9m 30s',
      wait: '9m 30s',
      topic: 'Technical Support',
      priority: 'High',
      avatar: '/src/assets/images/users/avatar-6.png',
      online: false
    },
    {
      id: 7,
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      lastMessage: 'Refund request update.',
      waitTime: '11m 05s',
      wait: '11m 05s',
      topic: 'Refund Request',
      priority: 'Medium',
      avatar: '/src/assets/images/users/avatar-7.png',
      online: true
    },
    {
      id: 8,
      name: 'Robert Taylor',
      email: 'robert.t@email.com',
      lastMessage: 'Product inquiry details.',
      waitTime: '12m 40s',
      wait: '12m 40s',
      topic: 'Product Inquiry',
      priority: 'Low',
      avatar: '/src/assets/images/users/avatar-8.png',
      online: false
    }
  ];

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

    // If no filters/search active -> show available first (preserve raw order)
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
        {/* Top Row */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <MainCard sx={{ p: 2.5, height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              New vs Closed
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.vars?.palette?.info?.main ?? '#00bcd4' }} />
                <Typography variant="caption">New</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.vars?.palette?.success?.main ?? '#4caf50' }} />
                <Typography variant="caption">Closed</Typography>
              </Box>
            </Box>
            <Box sx={{ width: '100%', height: 200 }}>
              <LineChart
                hideLegend
                height={200}
                grid={{ horizontal: true, vertical: false }}
                xAxis={[{ scaleType: 'point', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], tickSize: 7, disableLine: true }]}
                yAxis={[{ tickSize: 7, disableLine: true }]}
                margin={{ left: 20, right: 20 }}
                series={[
                  { type: 'line', data: [12, 15, 10, 8, 9, 11, 15], label: 'New', id: 'new', stroke: theme.vars?.palette?.info?.main ?? '#00bcd4', strokeWidth: 2, showMark: true },
                  { type: 'line', data: [5, 6, 7, 4, 3, 6, 8], label: 'Closed', id: 'closed', stroke: theme.vars?.palette?.success?.main ?? '#4caf50', strokeWidth: 2, showMark: true }
                ]}
                sx={{
                  '& .MuiChartsGrid-line': { strokeDasharray: '4 4', stroke: theme.vars.palette.divider },
                  '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>15</Typography>
                <Typography variant="body2" color="text.secondary">New (week)</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" fontWeight={500}>8</Typography>
                <Typography variant="body2" color="text.secondary">Closed (week)</Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 8 }}>
          <MainCard sx={{ p: 2.5, height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Recent chats
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/portal/chats')}
                sx={{ textTransform: 'none', color: '#008E86' }}
              >
                View all
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ overflow: 'auto', flex: 1, width: '100%' }}>
              {recentChats.slice(0, 3).map((chat) => (
                <ListItem
                  key={chat.id}
                  alignItems="flex-start"
                  sx={{
                    px: 0,
                    py: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                  onClick={() => navigate('/portal/chats', { state: { chatId: chat.id } })}
                >
                  <Avatar
                    sx={{
                      bgcolor: '#008E86',
                      width: 40,
                      height: 40,
                      mr: 2,
                      flexShrink: 0
                    }}
                  >
                    {chat.avatar}
                  </Avatar>
                  <ListItemText
                    primary={chat.name}
                    secondary={chat.message}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                    {chat.time}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </MainCard>
        </Grid>

        {}
        <Grid size={{ xs: 12, lg: 8 }}>
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
              {queueData.slice(0, 4).map((item, index) => (
                <ListItem key={index} alignItems="center" sx={{ px: 0, py: 1.5 }}>
                  <Avatar
                    src={item.avatar}
                    alt={item.name}
                    sx={{ width: 40, height: 40, mr: 2, flexShrink: 0, bgcolor: '#9FBCBF', color: '#1A3A3C' }}
                  >
                    {getInitials(item.name)}
                  </Avatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.waitTime} • ${item.topic}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 40, flexShrink: 0 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: theme.vars?.palette?.text?.primary ?? 'inherit' }}>
                      {index + 1}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
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
                  )))}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      </Grid>

      {/* Queue Modal */}
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

      {/* Agent Status Drawer */}
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
