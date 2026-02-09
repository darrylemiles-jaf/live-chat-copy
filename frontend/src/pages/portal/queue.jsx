import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Close } from 'mdi-material-ui';

import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import { withAlpha } from '../../utils/colorUtils';
import QueueHeader from '../../sections/queue/QueueHeader';
import WaitingQueueSection from '../../sections/queue/WaitingQueueSection';
import CustomerDetailsSection from '../../sections/queue/CustomerDetailsSection';
import CurrentStatusSection from '../../sections/queue/CurrentStatusSection';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Queue' }];

const queueItems = [
  {
    id: 1,
    name: 'John D.',
    wait: 'Waiting 5 min',
    email: 'johndoe@email.com',
    priority: 'High',
    orderId: '#12345',
    status: 'Billing Issue',
    issue: 'Problem with the recent billing charge',
    notes: 'Customer has been waiting 5 minutes.'
  },
  {
    id: 2,
    name: 'Emily S.',
    wait: 'Waiting 2 min',
    email: 'emily.s@company.com',
    priority: 'Medium',
    orderId: '#12346',
    status: 'Account Login',
    issue: 'Unable to reset password on mobile app',
    notes: 'Customer tried reset twice.'
  },
  {
    id: 3,
    name: 'Michael T.',
    wait: 'Waiting 8 min',
    email: 'michael.t@email.com',
    priority: 'High',
    orderId: '#12347',
    status: 'Payment Failed',
    issue: 'Card declined at checkout',
    notes: 'Needs manual verification.'
  },
  {
    id: 4,
    name: 'Sarah L.',
    wait: 'Waiting 3 min',
    email: 'sarah.l@company.com',
    priority: 'Low',
    orderId: '#12348',
    status: 'Shipping Delay',
    issue: 'Package shows delayed status',
    notes: 'Requested updated ETA.'
  },
  {
    id: 5,
    name: 'David R.',
    wait: 'Waiting 1 min',
    email: 'david.r@email.com',
    priority: 'Medium',
    orderId: '#12349',
    status: 'Refund Status',
    issue: 'Refund not received after 5 days',
    notes: 'Asked for refund timeline.'
  }
];

const INITIAL_ACTIVE_CHATS = 3;
const INITIAL_RESOLVED_TODAY = 12;

// ==============================|| HELPER FUNCTIONS ||============================== //

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

// ==============================|| MAIN QUEUE COMPONENT ||============================== //

const Queue = () => {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  const navigate = useNavigate();

  const [queue, setQueue] = useState(queueItems);
  const [activeChats, setActiveChats] = useState(INITIAL_ACTIVE_CHATS);
  const [resolvedToday, setResolvedToday] = useState(INITIAL_RESOLVED_TODAY);
  const [selectedId, setSelectedId] = useState(queueItems[0]?.id ?? null);
  const [detailsTab, setDetailsTab] = useState('info');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  const selected = useMemo(() => queue.find((item) => item.id === selectedId), [queue, selectedId]);

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

  const handleOpenChat = () => {
    if (!selected) return;
    const customer = selected;
    setQueue((prev) => prev.filter((item) => item.id !== customer.id));
    setActiveChats((prev) => prev + 1);
    navigate('/portal/chats', { state: { from: 'queue', customer } });
  };

  const handleResolve = () => {
    if (!selected) return;
    setQueue((prev) => prev.filter((item) => item.id !== selected.id));
    setResolvedToday((prev) => prev + 1);
  };

  return (
    <React.Fragment>
      <Breadcrumbs heading="Queue" links={breadcrumbLinks} subheading="View and manage your chat queue here." />

      <Box sx={{ mt: 2, borderRadius: '28px', border: `1px solid ${palette.divider}` }}>
        <Paper
          elevation={0}
          sx={{ position: 'relative', overflow: 'hidden', borderRadius: '28px', p: { xs: 2, md: 3 }, boxShadow: 'none' }}
        >
          <QueueHeader palette={palette} />

          <Grid container spacing={2.5} size={12} alignItems="stretch" sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <WaitingQueueSection
                palette={palette}
                queue={queue}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onViewMore={handleViewMore}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CustomerDetailsSection
                palette={palette}
                selected={selected}
                detailsTab={detailsTab}
                setDetailsTab={setDetailsTab}
                handleOpenChat={handleOpenChat}
                handleResolve={handleResolve}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CurrentStatusSection palette={palette} statusCards={statusCards} />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Dialog
        open={isQueueModalOpen}
        onClose={handleCloseQueueModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { boxShadow: 'none', border: `1px solid ${palette.divider}` } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">All Queue</Typography>
          <IconButton onClick={handleCloseQueueModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Stack spacing={1.25}>
            {queue.length === 0 ? (
              <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                No customers in queue.
              </Typography>
            ) : (
              queue.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <Box
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      handleCloseQueueModal();
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? withAlpha(palette.primary.lighter, 0.45) : 'transparent',
                      border: isSelected ? `1px solid ${withAlpha(palette.primary.main, 0.2)}` : `1px solid ${palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: withAlpha(palette.primary.lighter, 0.35)
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontWeight: 700,
                          bgcolor: getAvatarBg(palette, item)
                        }}
                      >
                        {getInitials(item.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                          {item.email}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                      {item.wait}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default Queue;
