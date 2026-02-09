import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Typography,
  InputAdornment,
  Badge,
  Chip
} from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';

const ChatListSection = ({ chats, selectedChat, onSelectChat, searchQuery, onSearchChange }) => {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: 360 },
        borderRight: { xs: 0, md: 1 },
        borderColor: 'divider',
        display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search Messages"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined style={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'action.hover'
            }
          }}
        />
      </Box>

      {/* Chat List */}
      <List sx={{ overflow: 'auto', flex: 1, pt: 0 }}>
        {chats
          .filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((chat) => (
            <ListItem
              key={chat.id}
              button
              selected={selectedChat?.id === chat.id}
              onClick={() => onSelectChat(chat)}
              sx={{
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: chat.online ? '#44b700' : '#bdbdbd',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid white'
                    }
                  }}
                >
                  <Avatar src={chat.avatar} alt={chat.name}>
                    {chat.name.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: chat.unread > 0 ? 600 : 400 }}>
                      {chat.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {chat.timestamp}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: chat.unread > 0 ? '200px' : '220px',
                        fontWeight: chat.unread > 0 ? 600 : 400
                      }}
                    >
                      {chat.lastMessage}
                    </Typography>
                    {chat.unread > 0 && (
                      <Chip
                        label={chat.unread}
                        size="small"
                        color="primary"
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default ChatListSection;
