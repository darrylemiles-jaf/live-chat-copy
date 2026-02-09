import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setQueue((prev) => shuffle(prev));
    window.setTimeout(() => setIsRefreshing(false), 450);
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
        <Paper elevation={14} sx={{ position: 'relative', overflow: 'hidden', borderRadius: '28px', p: { xs: 2, md: 3 } }}>
          <QueueHeader palette={palette} />

          <Grid container spacing={2.5} size={12} alignItems="stretch" sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <WaitingQueueSection
                palette={palette}
                queue={queue}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                isRefreshing={isRefreshing}
                handleRefresh={handleRefresh}
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
    </React.Fragment>
  );
};

export default Queue;
