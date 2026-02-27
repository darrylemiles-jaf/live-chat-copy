import React from 'react';
import { Box, Typography, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@mui/material';
import { MessageText } from 'mdi-material-ui';
import MainCard from '../../components/MainCard';

/**
 * Shows the current agent's recent chats in a scrollable list.
 *
 * Props:
 *  - chatsLoading  {boolean}
 *  - recentChats   {array}
 *  - onViewMore    {function}  navigate to /portal/chats
 *  - onChatClick   {function(chat)}  navigate with chatId
 */
const RecentChatsSection = ({ chatsLoading, recentChats, onViewMore, onChatClick }) => (
  <MainCard sx={{ p: 2.5, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid #008E86' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Recent Chats
      </Typography>
      <Button size="small" onClick={onViewMore} sx={{ textTransform: 'none', color: '#008E86' }}>
        See more
      </Button>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <List sx={{ overflow: 'auto', flex: 1 }}>
      {chatsLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
          <Typography variant="body2" color="text.secondary">Loading chats...</Typography>
        </Box>
      ) : recentChats.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: 100,
            textAlign: 'center',
            px: 3,
            gap: 1.5
          }}
        >
          <MessageText size={48} style={{ opacity: 0.3 }} />
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>No Recent Chats</Typography>
            <Typography variant="body2" color="text.disabled">Your recent conversations will appear here</Typography>
          </Box>
        </Box>
      ) : (
        recentChats.map((chat, index) => (
          <ListItem
            key={index}
            onClick={() => onChatClick(chat)}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#008E86' }}>{chat.avatar || '?'}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={chat.name || 'Unknown Client'}
              secondary={
                <Box component="span">
                  {chat.message || '...'}
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
                    {chat.time || ''}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))
      )}
    </List>
  </MainCard>
);

export default RecentChatsSection;
