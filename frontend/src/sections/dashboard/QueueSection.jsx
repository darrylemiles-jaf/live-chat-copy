import React from 'react';
import { Box, Typography, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import { AccountClock } from 'mdi-material-ui';
import MainCard from '../../components/MainCard';

/**
 * Shows the live queue in a scrollable list with a count badge.
 *
 * Props:
 *  - queueLoading  {boolean}
 *  - queueData     {array}
 *  - onViewMore    {function}  open QueueDialog
 *  - onQueueClick  {function(chat)}  navigate to queue page with id
 */
const QueueSection = ({ queueLoading, queueData, onViewMore, onQueueClick }) => (
  <MainCard sx={{ p: 2.5, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Queue
      </Typography>
      <Button size="small" onClick={onViewMore} sx={{ textTransform: 'none', color: '#008E86' }}>
        See more
      </Button>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 2 }}>
      <Typography variant="h2" fontWeight={500}>{queueData.length}</Typography>
      <Typography variant="body2" color="text.secondary">In queue</Typography>
    </Box>
    <List sx={{ overflow: 'auto', flex: 1 }}>
      {queueLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
          <Typography variant="body2" color="text.secondary">Loading queue...</Typography>
        </Box>
      ) : queueData.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: 50,
            textAlign: 'center',
            px: 3,
            gap: 1.5
          }}
        >
          <AccountClock sx={{ fontSize: 200, opacity: 0.3 }} />
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>No Chats in Queue</Typography>
            <Typography variant="body2" color="text.disabled">All chats are currently being handled</Typography>
          </Box>
        </Box>
      ) : (
        queueData.map((chat, index) => {
          const client = chat.client || {};
          const initials = client.name
            ? client.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            : '?';

          return (
            <ListItem
              key={index}
              onClick={() => onQueueClick(chat)}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#008E86' }}>{initials}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={chat.name || 'Unknown Client'}
                secondary={<Box component="span">Waiting for {chat.waitTime || '...'}</Box>}
              />
            </ListItem>
          );
        })
      )}
    </List>
  </MainCard>
);

export default QueueSection;
