import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { withAlpha } from '../../utils/colorUtils';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import QueueDialog from '../../components/Dialog';
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
    lastMessage: 'Messages and calls are secured with end-to-end encryption...',
    priority: 'High',
    avatar: '/src/assets/images/users/avatar-1.png',
    online: true,
    orderId: '#12345',
    status: 'In Queue',
    issue: 'Problem with the recent billing charge',
    notes: 'Customer has been waiting 5 minutes.'
  },
  {
    id: 2,
    name: 'Emily S.',
    wait: 'Waiting 2 min',
    email: 'emily.s@company.com',
    lastMessage: 'You: Need help with mobile login reset.',
    priority: 'Medium',
    avatar: '/src/assets/images/users/avatar-2.png',
    online: true,
    orderId: '#12346',
    status: 'In Queue',
    issue: 'Unable to reset password on mobile app',
    notes: 'Customer tried reset twice.'
  },
  {
    id: 3,
    name: 'Michael T.',
    wait: 'Waiting 8 min',
    email: 'michael.t@email.com',
    lastMessage: 'Card declined during checkout.',
    priority: 'High',
    avatar: '/src/assets/images/users/avatar-3.png',
    online: false,
    orderId: '#12347',
    status: 'In Queue',
    issue: 'Card declined at checkout',
    notes: 'Needs manual verification.'
  },
  {
    id: 4,
    name: 'Sarah L.',
    wait: 'Waiting 3 min',
    email: 'sarah.l@company.com',
    lastMessage: 'Package still shows delayed status.',
    priority: 'Low',
    avatar: '/src/assets/images/users/avatar-4.png',
    online: true,
    orderId: '#12348',
    status: 'In Queue',
    issue: 'Package shows delayed status',
    notes: 'Requested updated ETA.'
  },
  {
    id: 5,
    name: 'David R.',
    wait: 'Waiting 1 min',
    email: 'david.r@email.com',
    lastMessage: 'Following up on refund timeline.',
    priority: 'Medium',
    avatar: '/src/assets/images/users/avatar-5.png',
    online: true,
    orderId: '#12349',
    status: 'In Queue',
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

      <Box sx={{ mt: 2, borderRadius: 1, border: `1px solid ${palette.divider}` }}>
        <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1, p: { xs: 2, md: 3 }, boxShadow: 'none' }}>
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
