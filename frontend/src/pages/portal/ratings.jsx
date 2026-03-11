import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CloseOutlined } from '@ant-design/icons';

import PageHead from '../../components/PageHead';
import ReusableTable from '../../components/ReusableTable';
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

// ─── Main component ───────────────────────────────────────────────────────────

const Ratings = () => {
  const theme = useTheme();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentData, setAgentData] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRatingsLeaderboard(50);
      setLeaderboard(res?.data?.map((agent, i) => ({ ...agent, rank: i + 1 })) ?? []);
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

  const columns = [
    {
      id: 'rank',
      label: '#',
      align: 'center',
      renderCell: (row) => {
        const medal = medalColor(row.rank);
        return (
          <Box
            sx={{
              width: 28, height: 28, borderRadius: '50%',
              bgcolor: medal ? medal : 'action.selected',
              color: medal ? '#fff' : 'text.secondary',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700,
              boxShadow: medal ? `0 0 0 2px ${medal}33` : 'none',
              mx: 'auto',
            }}
          >
            {row.rank}
          </Box>
        );
      },
    },
    {
      id: 'name',
      label: 'Agent',
      align: 'left',
      renderCell: (row) => {
        const avg = parseFloat(row.average_rating) || 0;
        const color = ratingColor(avg, theme);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: color + '22', color }}>
              {row.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} noWrap>{row.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{row.email}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'average_rating',
      label: 'Avg. Rating',
      align: 'center',
      renderCell: (row) => {
        const avg = parseFloat(row.average_rating) || 0;
        const color = ratingColor(avg, theme);
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color }}>{avg.toFixed(2)}</Typography>
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
        );
      },
    },
    {
      id: 'total_ratings',
      label: 'Reviews',
      align: 'center',
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={600}>{parseInt(row.total_ratings) || 0}</Typography>
      ),
    },
    {
      id: 'five_star',
      label: '5 ★',
      align: 'center',
      renderCell: (row) => (
        <Typography variant="body2" color="success.main" fontWeight={600}>{parseInt(row.five_star) || 0}</Typography>
      ),
    },
    {
      id: 'one_star',
      label: '1 ★',
      align: 'center',
      renderCell: (row) => (
        <Typography variant="body2" color="error.main" fontWeight={600}>{parseInt(row.one_star) || 0}</Typography>
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageHead title="Ratings" description="Timora Live Chat, Agent Ratings &amp; Leaderboard" />

      <ReusableTable
        columns={columns}
        rows={leaderboard}
        isLoading={loading}
        searchableColumns={['name', 'email']}
        noMessage="No ratings data available yet."
        onRowClick={handleAgentClick}
        settings={{ disablePagination: false }}
      />

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
