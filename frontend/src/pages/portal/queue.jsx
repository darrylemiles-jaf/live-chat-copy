import React from 'react';
import { Box, Grid, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';

import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import PageHead from '../../components/PageHead';
import QueueDialog from '../../sections/queue/QueueDialog';
import QueueHeader from '../../sections/queue/QueueHeader';
import WaitingQueueSection from '../../sections/queue/WaitingQueueSection';
import CustomerDetailsSection from '../../sections/queue/CustomerDetailsSection';
import CurrentStatusSection from '../../sections/queue/CurrentStatusSection';
import useQueue from '../../hooks/useQueue';
import { withAlpha } from '../../utils/colorUtils';
import { getAvatarBg, getInitials } from '../../utils/queue/queueTransformers';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Queue' }];

const Queue = () => {
  const {
    palette,
    queue,
    selectedId,
    selected,
    detailsTab,
    isQueueModalOpen,
    loading,
    snackbar,
    availableAgents,
    statusCards,
    setSelectedId,
    setDetailsTab,
    handleViewMore,
    handleCloseQueueModal,
    handleOpenChat,
    handleResolve,
    handleSnackbarClose,
  } = useQueue();

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
      <PageHead title="Queue" description="Timora Live Chat Queue Overview" />
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
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default Queue;
