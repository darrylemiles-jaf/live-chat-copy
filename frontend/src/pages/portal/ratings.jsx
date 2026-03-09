import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SearchOutlined, CloseOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';

import PageHead from '../../components/PageHead';
import MainCard from '../../components/MainCard';
import AgentRatingsTab, { Stars } from '../../components/AgentRatingsTab';
import { getRatingsLeaderboard, getAgentRatings } from '../../api/ratingsApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ratingColor = (avg, theme) => {
  if (avg >= 4.5) return theme.vars.palette.success.main;
  if (avg >= 3.5) return theme.vars.palette.warning.main;
  if (avg >= 2.5) return theme.vars.palette.warning.light;
  return theme.vars.palette.error.main;
};

const ratingLabel = (avg) => {
  if (avg >= 4.5) return 'Excellent';
  if (avg >= 3.5) return 'Great';
  if (avg >= 2.5) return 'Good';
  if (avg >= 1.5) return 'Fair';
  return 'Poor';
};

const medalColor = (rank) => {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return null;
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <TableRow>
    {[40, 200, 120, 80, 80, 80].map((w, i) => (
      <TableCell key={i}>
        <Skeleton variant="text" width={w} />
      </TableCell>
    ))}
  </TableRow>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Ratings = () => {
  const theme = useTheme();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentData, setAgentData] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRatingsLeaderboard(50);
      setLeaderboard(res?.data ?? []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleAgentClick = async (agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
    setAgentLoading(true);
    setAgentData(null);
    try {
      const res = await getAgentRatings(agent.id);
      setAgentData(res);
    } catch {
      setAgentData(null);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAgent(null);
    setAgentData(null);
  };

  const filtered = leaderboard.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const topAvg = filtered.length > 0 ? parseFloat(filtered[0]?.average_rating) : 0;

  return (
    <React.Fragment>
      <PageHead title="Ratings" description="Timora Live Chat, Agent Ratings &amp; Leaderboard" />

      {/* ── Header row ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Agent Ratings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Leaderboard ranked by average customer rating
          </Typography>
        </Box>
      </Box>

      {/* ── Summary chips ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        {loading ? (
          [1, 2, 3].map((k) => <Skeleton key={k} variant="rounded" width={130} height={32} />)
        ) : (
          <>
            <Chip
              icon={<TrophyOutlined />}
              label={`${leaderboard.length} Rated Agent${leaderboard.length !== 1 ? 's' : ''}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            {leaderboard.length > 0 && (
              <Chip
                label={`Top avg: ${topAvg.toFixed(2)} ★`}
                size="small"
                variant="outlined"
                sx={{ borderColor: ratingColor(topAvg, theme), color: ratingColor(topAvg, theme) }}
              />
            )}
            <Chip
              label={`${leaderboard.reduce((s, a) => s + parseInt(a.total_ratings || 0), 0)} Total Reviews`}
              size="small"
              variant="outlined"
            />
          </>
        )}
      </Box>

      {/* ── Table card ── */}
      <MainCard contentSX={{ p: 0 }}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
          <TextField
            placeholder="Search by name or email…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined style={{ fontSize: 14 }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.4 } }}>
                <TableCell sx={{ width: 52 }}>#</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell align="center">Avg. Rating</TableCell>
                <TableCell align="center">Reviews</TableCell>
                <TableCell align="center">5 ★</TableCell>
                <TableCell align="center">1 ★</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.disabled">
                          {search ? 'No agents match your search.' : 'No ratings data available yet.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : filtered.map((agent, idx) => {
                    const rank = idx + 1;
                    const avg = parseFloat(agent.average_rating) || 0;
                    const color = ratingColor(avg, theme);
                    const medal = medalColor(rank);
                    const total = parseInt(agent.total_ratings) || 0;

                    return (
                      <TableRow
                        key={agent.id}
                        hover
                        onClick={() => handleAgentClick(agent)}
                        sx={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      >
                        {/* rank */}
                        <TableCell>
                          <Box
                            sx={{
                              width: 28, height: 28, borderRadius: '50%',
                              bgcolor: medal ? medal : 'action.selected',
                              color: medal ? '#fff' : 'text.secondary',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.72rem', fontWeight: 700,
                              boxShadow: medal ? `0 0 0 2px ${medal}33` : 'none',
                            }}
                          >
                            {rank}
                          </Box>
                        </TableCell>

                        {/* agent name */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: color + '22', color }}>
                              {agent.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {agent.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {agent.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* avg rating */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color }}>
                                {avg.toFixed(2)}
                              </Typography>
                              <Stars value={avg} size="0.8rem" color={color} />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(avg / 5) * 100}
                              sx={{
                                width: 70, height: 4, borderRadius: 4,
                                bgcolor: 'action.disabledBackground',
                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
                              }}
                            />
                            <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: '0.7rem' }}>
                              {ratingLabel(avg)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* total reviews */}
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600}>{total}</Typography>
                        </TableCell>

                        {/* 5-star count */}
                        <TableCell align="center">
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            {parseInt(agent.five_star) || 0}
                          </Typography>
                        </TableCell>

                        {/* 1-star count */}
                        <TableCell align="center">
                          <Typography variant="body2" color="error.main" fontWeight={600}>
                            {parseInt(agent.one_star) || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* ── Agent detail dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {selectedAgent && (
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 700 }}>
                {selectedAgent.name?.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {selectedAgent?.name ?? 'Agent'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedAgent?.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <AgentRatingsTab ratingData={agentData} loading={agentLoading} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default Ratings;
