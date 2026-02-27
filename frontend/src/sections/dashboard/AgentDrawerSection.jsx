import React from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import { Close } from 'mdi-material-ui';

const statusDotColor = (status) => {
  if (status === 'available') return '#4caf50';
  if (status === 'busy') return '#f44336';
  if (status === 'away') return '#ffb300';
  return '#f44336';
};

/**
 * Sliding drawer that shows the full paginated/filtered agent list.
 *
 * Props:
 *  - open              {boolean}
 *  - onClose           {function}
 *  - displayedAgents   {array}
 *  - agentSearch       {string}
 *  - agentStatusFilter {string}
 *  - agentPage         {number}
 *  - totalPages        {number}
 *  - usersLoading      {boolean}
 *  - usersError        {any}
 *  - onSearchChange    {function(value)}
 *  - onStatusChange    {function(value)}
 *  - onPageChange      {function(page)}
 */
const AgentDrawerSection = ({
  open,
  onClose,
  displayedAgents,
  agentSearch,
  agentStatusFilter,
  agentPage,
  totalPages,
  usersLoading,
  usersError,
  onSearchChange,
  onStatusChange,
  onPageChange
}) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box sx={{ width: { xs: '100vw', sm: 400 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, bgcolor: '#064856', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2" color="inherit">Agent Status</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search agents"
          value={agentSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="agent-status-filter-label">Status</InputLabel>
          <Select
            labelId="agent-status-filter-label"
            value={agentStatusFilter}
            label="Status"
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="busy">Busy</MenuItem>
            <MenuItem value="away">Away</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List sx={{ overflow: 'auto', p: 2.5, flex: 1 }}>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Typography variant="body2" color="text.secondary">Loading agents...</Typography>
          </Box>
        ) : usersError ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Typography variant="body2" color="error">Error loading agents</Typography>
          </Box>
        ) : displayedAgents.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Typography variant="body2" color="text.secondary">No agents found</Typography>
          </Box>
        ) : (
          displayedAgents.map((agent, index) => (
            <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
              <Avatar sx={{ bgcolor: '#008E86', width: 40, height: 40, mr: 2, flexShrink: 0 }}>
                {agent.avatar}
              </Avatar>
              <ListItemText
                primary={agent.name}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: statusDotColor(agent.status),
                    flexShrink: 0
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {agent.status}
                </Typography>
              </Box>
            </ListItem>
          ))
        )}
      </List>

      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={agentPage}
          onChange={(_, value) => onPageChange(value)}
          size="small"
          color="primary"
        />
      </Box>
    </Box>
  </Drawer>
);

export default AgentDrawerSection;
