import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Box, Typography, Skeleton, LinearProgress,
  Divider, Tooltip, IconButton, Popover
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge } from '@mui/x-charts/Gauge';
import {
  MessageOutlined, ClockCircleOutlined, CheckCircleOutlined,
  TeamOutlined, SyncOutlined, InfoCircleOutlined
} from '@ant-design/icons';

import PageHead from '../../components/PageHead';
import MainCard from '../../components/MainCard';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import { getChatStats, getDetailedStats } from '../../api/chatApi';
import socketService from '../../services/socketService';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Dashboard' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color, loading }) => (
  <MainCard sx={{ p: 2.5, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={80} height={50} />
        ) : (
          <Typography variant="h3" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
            {value}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: 48, height: 48, borderRadius: '50%',
          bgcolor: `${color}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color,
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
    </Box>
  </MainCard>
);

const RankedRow = ({ rank, name, subtext, value, percent, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.25 }}>
    <Box
      sx={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        bgcolor: rank <= 3 ? '#008E86' : 'action.selected',
        color: rank <= 3 ? 'white' : 'text.secondary',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700
      }}
    >
      {rank}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600} noWrap>{name}</Typography>
      {subtext && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {subtext}
        </Typography>
      )}
      {percent !== undefined && (
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            mt: 0.5, height: 4, borderRadius: 2, bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { bgcolor: color || '#008E86', borderRadius: 2 }
          }}
        />
      )}
    </Box>
    <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0 }}>
      {value}
    </Typography>
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const theme = useTheme();
  const [scoreGuideAnchor, setScoreGuideAnchor] = useState(null);
  const scoreGuideOpen = Boolean(scoreGuideAnchor);

  const emptyBase = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    newChats: [0, 0, 0, 0, 0, 0, 0],
    closedChats: [0, 0, 0, 0, 0, 0, 0],
    weeklyTotal: { new: 0, closed: 0 },
    avgResponseTime: 0,
    avgResolutionTime: 0,
    activeChats: 0,
    queuedChats: 0,
    totalResolved: 0,
  };

  const emptyDetailed = {
    statusBreakdown: { queued: 0, active: 0, ended: 0 },
    topAgents: [],
    topClients: [],
    agentAvailability: { available: 0, busy: 0, away: 0, total: 0, availPercent: 0 },
  };

  const [orgStats, setOrgStats] = useState(emptyBase);
  const [detailedStats, setDetailedStats] = useState(emptyDetailed);
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingDetailed, setLoadingDetailed] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const formatDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds === 0) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const fetchBaseStats = useCallback(async () => {
    try {
      const res = await getChatStats();
      if (res.success) setOrgStats(res.data);
    } catch (e) {
      console.error('Error fetching base stats:', e);
    } finally {
      setLoadingBase(false);
    }
  }, []);

  const fetchDetailedStats = useCallback(async () => {
    try {
      const res = await getDetailedStats();
      if (res.success) setDetailedStats(res.data);
    } catch (e) {
      console.error('Error fetching detailed stats:', e);
    } finally {
      setLoadingDetailed(false);
      setLastUpdated(new Date());
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchBaseStats();
    fetchDetailedStats();
  }, [fetchBaseStats, fetchDetailedStats]);

  // Initial load
  useEffect(() => { refreshAll(); }, [refreshAll]);

  // Real-time socket updates
  useEffect(() => {
    let attached = false;
    const trigger = () => refreshAll();

    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) {
        s.on('queue_update', trigger);
        s.on('chat_assigned', trigger);
        s.on('chat_status_update', trigger);
        s.on('user_status_changed', trigger);
        s.on('stats_update', trigger);
        attached = true;
      }
    };
    tryAttach();
    const retry = setInterval(() => { if (attached) clearInterval(retry); else tryAttach(); }, 500);

    return () => {
      clearInterval(retry);
      const s = socketService.socket;
      if (s && attached) {
        s.off('queue_update', trigger);
        s.off('chat_assigned', trigger);
        s.off('chat_status_update', trigger);
        s.off('user_status_changed', trigger);
        s.off('stats_update', trigger);
      }
    };
  }, [refreshAll]);

  // Fallback polling every 60 seconds
  useEffect(() => {
    const interval = setInterval(refreshAll, 60000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const loading = loadingBase || loadingDetailed;
  const { topAgents, topClients, agentAvailability } = detailedStats;
  const dividerColor = theme.vars?.palette?.divider ?? theme.palette.divider;

  const statusChips = [
    { label: 'Active', value: orgStats.activeChats, dotColor: '#22c55e', bg: '#f0fdf4' },
    { label: 'Queued', value: orgStats.queuedChats, dotColor: '#f59e0b', bg: '#fffbeb' },
    { label: 'New this week', value: orgStats.weeklyTotal.new, dotColor: '#3b82f6', bg: '#eff6ff' },
    { label: 'Resolved this week', value: orgStats.weeklyTotal.closed, dotColor: '#008E86', bg: '#f0fdfa' },
    { label: 'Total Resolved', value: orgStats.totalResolved, dotColor: '#64748b', bg: '#f8fafc' },
  ];

  return (
    <>
      <PageHead title="Dashboard" description="Timora Live Chat Overview" />
      <Breadcrumbs
        heading="Dashboard"
        links={breadcrumbLinks}
        subheading="Real-time insights into your live chat operations."
      />

      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2.5}>

          {/* ── Row 1: KPI Cards ─────────────────────────────────────── */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Active Chats"
              value={orgStats.activeChats}
              icon={<MessageOutlined style={{ fontSize: 22 }} />}
              color="#008E86"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="In Queue"
              value={orgStats.queuedChats}
              icon={<TeamOutlined style={{ fontSize: 22 }} />}
              color="#f59e0b"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Avg Response Time"
              value={formatDuration(orgStats.avgResponseTime)}
              icon={<ClockCircleOutlined style={{ fontSize: 22 }} />}
              color="#3b82f6"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Avg Resolution Time"
              value={formatDuration(orgStats.avgResolutionTime)}
              icon={<CheckCircleOutlined style={{ fontSize: 22 }} />}
              color="#8b5cf6"
              loading={loading}
            />
          </Grid>

          {/* ── Row 2: Status Strip ──────────────────────────────────── */}
          <Grid size={{ xs: 12 }}>
            <MainCard sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Chats by Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {lastUpdated && (
                    <Typography variant="caption" color="text.disabled">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </Typography>
                  )}
                  <Tooltip title="Refresh">
                    <IconButton size="small" onClick={refreshAll}>
                      <SyncOutlined style={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {statusChips.map((chip) => (
                  <Box
                    key={chip.label}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 2.5, py: 1.5, borderRadius: 2, bgcolor: chip.bg,
                      border: `1px solid ${chip.dotColor}22`, minWidth: 130, flex: 1
                    }}
                  >
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: chip.dotColor, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                        {chip.label}
                      </Typography>
                      {loading ? (
                        <Skeleton variant="text" width={36} height={28} />
                      ) : (
                        <Typography variant="h5" fontWeight={700} sx={{ color: chip.dotColor, lineHeight: 1.2 }}>
                          {chip.value}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </MainCard>
          </Grid>

          {/* ── Row 3: Trend Chart ───────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <MainCard sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Chats Trend
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#008E86' }} />
                    <Typography variant="caption">New</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Typography variant="caption">Resolved</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {loading ? (
                <Skeleton variant="rectangular" height={230} sx={{ borderRadius: 1 }} />
              ) : (
                <LineChart
                  hideLegend
                  height={230}
                  grid={{ horizontal: true, vertical: false }}
                  xAxis={[{ scaleType: 'point', data: orgStats.days, tickSize: 7, disableLine: true }]}
                  yAxis={[{ tickSize: 7, disableLine: true }]}
                  margin={{ left: 28, right: 20, top: 10, bottom: 30 }}
                  series={[
                    {
                      type: 'line', data: orgStats.newChats, label: 'New', id: 'new',
                      color: '#008E86', strokeWidth: 2.5, showMark: true, area: true
                    },
                    {
                      type: 'line', data: orgStats.closedChats, label: 'Resolved', id: 'resolved',
                      color: '#f59e0b', strokeWidth: 2, showMark: true
                    }
                  ]}
                  sx={{
                    '& .MuiAreaElement-root': { opacity: 0.08 },
                    '& .MuiChartsGrid-line': { strokeDasharray: '4 4', stroke: dividerColor },
                    '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
                  }}
                />
              )}
              <Box sx={{ display: 'flex', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{orgStats.weeklyTotal.new}</Typography>
                  <Typography variant="caption" color="text.secondary">New this week</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{orgStats.weeklyTotal.closed}</Typography>
                  <Typography variant="caption" color="text.secondary">Resolved this week</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{formatDuration(orgStats.avgResponseTime)}</Typography>
                  <Typography variant="caption" color="text.secondary">Avg Response</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{formatDuration(orgStats.avgResolutionTime)}</Typography>
                  <Typography variant="caption" color="text.secondary">Avg Resolution</Typography>
                </Box>
              </Box>
            </MainCard>
          </Grid>

          {/* ── Agent Availability ───────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <MainCard sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                Agent Availability
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                {loading ? (
                  <Skeleton variant="circular" width={140} height={140} />
                ) : (
                  <Gauge
                    width={150}
                    height={150}
                    value={agentAvailability.availPercent}
                    startAngle={-110}
                    endAngle={110}
                    sx={{
                      '& .MuiGauge-valueText text': { fontSize: '1.4rem', fontWeight: 700, fill: '#008E86' },
                      '& .MuiGauge-referenceArc': { fill: '#e2e8f0' },
                      '& .MuiGauge-valueArc': { fill: '#008E86' }
                    }}
                    text={({ value }) => `${value}%`}
                  />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Available Agents
                </Typography>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {[
                    { label: 'Available', count: agentAvailability.available, color: '#22c55e' },
                    { label: 'Busy', count: agentAvailability.busy, color: '#f44336' },
                    { label: 'Away', count: agentAvailability.away, color: '#f59e0b' },
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      </Box>
                      {loading ? (
                        <Skeleton variant="text" width={20} />
                      ) : (
                        <Typography variant="body2" fontWeight={600}>{item.count}</Typography>
                      )}
                    </Box>
                  ))}
                  <Divider sx={{ my: 0.25 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={700} color="text.secondary">Total Agents</Typography>
                    {loading ? (
                      <Skeleton variant="text" width={20} />
                    ) : (
                      <Typography variant="body2" fontWeight={700}>{agentAvailability.total}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </MainCard>
          </Grid>

          {/* ── Row 4: Rankings ──────────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <MainCard sx={{ p: 2.5, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                Top Agents by Resolved Chats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} variant="text" height={44} sx={{ mb: 0.5 }} />)
              ) : topAgents.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
                  No resolved chats yet
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {topAgents.map((agent, i) => (
                    <RankedRow
                      key={agent.id}
                      rank={i + 1}
                      name={agent.name}
                      subtext={`${agent.resolved} resolved`}
                      value={`${agent.percent}%`}
                      percent={agent.percent}
                      color={
                        i === 0 ? '#008E86'
                          : i === 1 ? '#3b82f6'
                            : i === 2 ? '#8b5cf6'
                              : '#94a3b8'
                      }
                    />
                  ))}
                </Box>
              )}
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <MainCard sx={{ p: 2.5, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                Top Active Clients
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} variant="text" height={44} sx={{ mb: 0.5 }} />)
              ) : topClients.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
                  No client data yet
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {topClients.map((client, i) => (
                    <RankedRow
                      key={client.id}
                      rank={i + 1}
                      name={client.name}
                      subtext={client.email}
                      value={`${client.chatCount} chats`}
                    />
                  ))}
                </Box>
              )}
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <MainCard sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Agent Performance Scores
                </Typography>

                <Tooltip title="View scoring guide">
                  <IconButton
                    size="small"
                    sx={{ p: 0.25 }}
                    onClick={(e) => setScoreGuideAnchor(e.currentTarget)}
                  >
                    <InfoCircleOutlined style={{ fontSize: 15, color: scoreGuideOpen ? '#008E86' : '#94a3b8' }} />
                  </IconButton>
                </Tooltip>

                <Popover
                  open={scoreGuideOpen}
                  anchorEl={scoreGuideAnchor}
                  onClose={() => setScoreGuideAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{ paper: { sx: { width: 290, p: 0, bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', mt: 0.5 } } }}
                >
                  {/* Header */}
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', letterSpacing: 0.3 }}>
                        Performance Score Guide
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', mt: 0.25 }}>
                        Based on average reply time across all messages
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setScoreGuideAnchor(null)} sx={{ p: 0.25, color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white' }, mt: -0.25, mr: -0.5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✕</span>
                    </IconButton>
                  </Box>

                  {/* Column labels */}
                  <Box sx={{ px: 2, pt: 1, pb: 0.25, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Response Time</Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Score</Typography>
                  </Box>

                  {/* Excellent */}
                  <Box sx={{ px: 2, pt: 0.75, pb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.6 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#22c55e', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.5 }}>Excellent</Typography>
                    </Box>
                    {[
                      { range: 'Less than or equal to 30 sec', score: 100 },
                      { range: 'Less than or equal to 1 min',  score: 95 },
                      { range: 'Less than or equal to 2 min',  score: 88 },
                      { range: 'Less than or equal to 3 min',  score: 82 },
                    ].map((row) => (
                      <Box key={row.range} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.35, pl: 1.75 }}>
                        <Typography sx={{ fontSize: '0.69rem', color: 'rgba(255,255,255,0.6)' }}>{row.range}</Typography>
                        <Typography sx={{ fontSize: '0.69rem', fontWeight: 700, color: '#22c55e', ml: 1.5, flexShrink: 0 }}>{row.score}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mx: 2, borderTop: '1px solid rgba(255,255,255,0.07)' }} />

                  {/* Acceptable */}
                  <Box sx={{ px: 2, pt: 0.75, pb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.6 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#f59e0b', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Acceptable</Typography>
                    </Box>
                    {[
                      { range: 'Less than or equal to 5 min',  score: 70 },
                    ].map((row) => (
                      <Box key={row.range} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.35, pl: 1.75 }}>
                        <Typography sx={{ fontSize: '0.69rem', color: 'rgba(255,255,255,0.6)' }}>{row.range}</Typography>
                        <Typography sx={{ fontSize: '0.69rem', fontWeight: 700, color: '#f59e0b', ml: 1.5, flexShrink: 0 }}>{row.score}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mx: 2, borderTop: '1px solid rgba(255,255,255,0.07)' }} />

                  {/* Needs Improvement */}
                  <Box sx={{ px: 2, pt: 0.75, pb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.6 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#f44336', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#f44336', textTransform: 'uppercase', letterSpacing: 0.5 }}>Needs Improvement</Typography>
                    </Box>
                    {[
                      { range: 'Less than or equal to 10 min', score: 45 },
                      { range: 'Less than or equal to 20 min', score: 30 },
                      { range: 'Less than or equal to 30 min', score: 20 },
                      { range: 'Greater than 30 min',          score: 10 },
                    ].map((row) => (
                      <Box key={row.range} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.35, pl: 1.75 }}>
                        <Typography sx={{ fontSize: '0.69rem', color: 'rgba(255,255,255,0.6)' }}>{row.range}</Typography>
                        <Typography sx={{ fontSize: '0.69rem', fontWeight: 700, color: '#f44336', ml: 1.5, flexShrink: 0 }}>{row.score}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Popover>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} variant="text" height={44} sx={{ mb: 0.5 }} />)
              ) : topAgents.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
                  No performance data yet
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {topAgents.map((agent, i) => {
                    // 🟢 Excellent: ≤ 3min | 🟡 Acceptable: ≤ 5min | 🔴 Needs Improvement: > 5min
                    const r = agent.avgResponse;
                    const score = r === 0  ? 100
                      : r <= 30   ? 100  // ≤ 30s  → 100 🟢
                      : r <= 60   ? 95   // ≤ 1min → 95  🟢
                      : r <= 120  ? 88   // ≤ 2min → 88  🟢
                      : r <= 180  ? 82   // ≤ 3min → 82  🟢
                      : r <= 300  ? 70   // ≤ 5min → 70  🟡
                      : r <= 600  ? 45   // ≤ 10min→ 45  🔴
                      : r <= 1200 ? 30   // ≤ 20min→ 30  🔴
                      : r <= 1800 ? 20   // ≤ 30min→ 20  🔴
                      : 10;              // >30min → 10  🔴
                    const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#f44336';
                    return (
                      <Box key={agent.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                            bgcolor: i < 3 ? '#008E86' : 'action.selected',
                            color: i < 3 ? 'white' : 'text.secondary',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700
                          }}
                        >
                          {i + 1}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{agent.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            Avg reply time: {formatDuration(agent.avgResponse)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            border: `3px solid ${scoreColor}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} sx={{ color: scoreColor }}>
                            {score}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </MainCard>
          </Grid>

        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
