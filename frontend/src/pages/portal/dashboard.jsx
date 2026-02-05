import { Grid } from '@mui/material';
import { Forum, TimerSandComplete, AccountCheck } from 'mdi-material-ui';

import React from 'react';

import AnalyticalCard from '../../components/AnalyticalCard';

const Dashboard = () => {
  return (
    <React.Fragment>
      <Grid container spacing={2} size={12} justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticalCard icon={<Forum />} title={'Active Chats'} count={12} status={'ongoing'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticalCard color={'#F38828'} icon={<TimerSandComplete />} title={'Users in Queue'} count={8} status={'waiting'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticalCard color={'#37A973'} icon={<AccountCheck />} title={'Verified Users'} count={5} status={'verified'} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Dashboard;
