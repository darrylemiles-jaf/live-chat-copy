import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import MainCard from '../../components/MainCard';

/**
 * Reusable stats chart card used for both Organisation Overview and My Performance.
 *
 * Props:
 *  - title       {string}   Card heading
 *  - stats       {object}   { days, newChats, closedChats, weeklyTotal, avgResponseTime, avgResolutionTime }
 *  - theme       {object}   MUI theme object (for chart grid colours)
 *  - formatDuration {function}  (seconds) => string
 */
const StatsChartSection = ({ title, stats, theme, formatDuration }) => (
  <MainCard sx={{ p: 2.5, height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
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
        xAxis={[{ scaleType: 'point', data: stats.days, tickSize: 7, disableLine: true }]}
        yAxis={[{ tickSize: 7, disableLine: true }]}
        margin={{ left: 20, right: 20 }}
        series={[
          { type: 'line', data: stats.newChats, label: 'Requests', id: 'requests', stroke: '#2196f3', strokeWidth: 2, showMark: true },
          { type: 'line', data: stats.closedChats, label: 'Resolved', id: 'resolved', stroke: '#ff9800', strokeWidth: 2, showMark: true }
        ]}
        sx={{
          '& .MuiChartsGrid-line': { strokeDasharray: '4 4', stroke: theme.vars.palette.divider },
          '& .MuiChartsAxis-root.MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: 'transparent' }
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h3" fontWeight={500}>{stats.weeklyTotal.new}</Typography>
        <Typography variant="body2" color="text.secondary">Requests (week)</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h3" fontWeight={500}>{stats.weeklyTotal.closed}</Typography>
        <Typography variant="body2" color="text.secondary">Resolved (week)</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h3" fontWeight={500}>{formatDuration(stats.avgResponseTime)}</Typography>
        <Typography variant="body2" color="text.secondary">Avg Response</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h3" fontWeight={500}>{formatDuration(stats.avgResolutionTime)}</Typography>
        <Typography variant="body2" color="text.secondary">Avg Resolution</Typography>
      </Box>
    </Box>
  </MainCard>
);

export default StatsChartSection;
