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
  Chip,
  Divider
} from '@mui/material';
import { SearchOutlined, MessageOutlined } from '@ant-design/icons';

const ChatListSection = ({ chats, selectedChat, onSelectChat, searchQuery, onSearchChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'queued': return '#f59e0b';
      case 'ended': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 380 },
        borderRight: { xs: 0, md: 1 },
        borderColor: 'divider',
        display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#fafbfc'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Messages
          </Typography>
          <Chip
            label={chats.length}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, minWidth: 32 }}
          />
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined style={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f1f5f9',
              border: 'none',
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: 'primary.light'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 1
              }
            }
          }}
        />
      </Box>

      <Divider />

      {/* Chat List */}
      <List sx={{ overflow: 'auto', flex: 1, pt: 0, px: 1 }}>
        {filteredChats.length === 0 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            px: 3,
            textAlign: 'center'
          }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <MessageOutlined style={{ fontSize: 28, color: '#94a3b8' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Typography>
          </Box>
        )}

        {filteredChats.map((chat, index) => (
          <ListItem
            key={chat.id}
            button
            selected={selectedChat?.id === chat.id}
            onClick={() => onSelectChat(chat)}
            sx={{
              py: 1.5,
              px: 2,
              my: 0.5,
              borderRadius: 2,
              transition: 'all 0.2s ease',
              bgcolor: selectedChat?.id === chat.id ? 'primary.lighter' : 'transparent',
              borderLeft: selectedChat?.id === chat.id ? '3px solid' : '3px solid transparent',
              borderLeftColor: selectedChat?.id === chat.id ? 'primary.main' : 'transparent',
              '&:hover': {
                bgcolor: selectedChat?.id === chat.id ? 'primary.lighter' : '#f1f5f9',
                transform: 'translateX(2px)'
              },
              '&.Mui-selected': {
                bgcolor: 'primary.lighter',
                '&:hover': {
                  bgcolor: 'primary.lighter'
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
                    backgroundColor: getStatusColor(chat.status),
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: `0 0 0 1px ${getStatusColor(chat.status)}30`
                  }
                }}
              >
                <Avatar
                  src={chat.avatar}
                  alt={chat.name}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  {chat.name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: chat.unread > 0 ? 700 : 500,
                      color: 'text.primary',
                      fontSize: '0.9rem'
                    }}
                  >
                    {chat.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: chat.unread > 0 ? 'primary.main' : 'text.disabled',
                      fontWeight: chat.unread > 0 ? 600 : 400,
                      fontSize: '11px'
                    }}
                  >
                    {chat.timestamp}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: chat.unread > 0 ? '180px' : '220px',
                      fontWeight: chat.unread > 0 ? 500 : 400,
                      color: chat.unread > 0 ? 'text.primary' : 'text.secondary',
                      fontSize: '0.8rem'
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
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  )}
                </Box>
              }
              sx={{ ml: 1 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChatListSection;
