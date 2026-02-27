import React from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import MainCard from '../../components/MainCard';

const statusDotColor = (status) => {
  if (status === 'available') return '#4caf50';
  if (status === 'busy') return '#f44336';
  if (status === 'away') return '#ffb300';
  return '#f44336';
};

/**
 * Compact agent-status table card on the dashboard.
 *
 * Props:
 *  - sortedAgentStatus {array}
 *  - usersLoading      {boolean}
 *  - usersError        {any}
 *  - onViewMore        {function}  open agent drawer
 */
const AgentStatusTableSection = ({ sortedAgentStatus, usersLoading, usersError, onViewMore }) => (
  <MainCard sx={{ p: 2.5, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Agent status
      </Typography>
      <Button size="small" onClick={onViewMore} sx={{ textTransform: 'none', color: '#008E86' }}>
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
                <Typography variant="body2" color="text.secondary">Loading agents...</Typography>
              </TableCell>
            </TableRow>
          ) : usersError ? (
            <TableRow>
              <TableCell colSpan={2} align="center">
                <Typography variant="body2" color="error">Error loading agents</Typography>
              </TableCell>
            </TableRow>
          ) : sortedAgentStatus.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} align="center">
                <Typography variant="body2" color="text.secondary">No agents available</Typography>
              </TableCell>
            </TableRow>
          ) : (
            sortedAgentStatus.slice(0, 8).map((agent, index) => (
              <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell component="th" scope="row">{agent.name}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusDotColor(agent.status), flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {agent.status}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </MainCard>
);

export default AgentStatusTableSection;
