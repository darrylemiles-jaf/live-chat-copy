import React, { useState } from 'react';
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
  Divider,
  Stack,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { SearchOutlined, MessageOutlined } from '@ant-design/icons';

const STATUS_FILTERS = [
  { value: 'active', label: 'Active', color: '#22c55e' },
  { value: 'ended',  label: 'Ended',  color: '#94a3b8' },
  { value: 'all',    label: 'All',    color: '#008E86' },

];

const ChatListSection = ({ chats, selectedChat, onSelectChat, searchQuery = '', onSearchChange, statusFilter = 'all', onStatusFilterChange }) => {
  const [sortOrder, setSortOrder] = useState('newest');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'queued': return '#f59e0b';
      case 'ended': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const filteredChats = chats
    .filter(chat => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (chat.name || '').toLowerCase().includes(query) ||
        (chat.lastMessage || '').toLowerCase().includes(query);
      const matchesStatus = !statusFilter || statusFilter === 'all' || chat.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const tsA = a.rawTimestamp || 0;
      const tsB = b.rawTimestamp || 0;
      return sortOrder === 'newest' ? tsB - tsA : tsA - tsB;
    });

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#fafbfc'
      }}
    >
      <Box sx={{ p: 2.5, pb: 2, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Messages
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        
            <FormControl size="small">
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                sx={{
                  fontSize: '0.75rem',
                  height: 28,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                  '& .MuiSelect-select': { py: 0.25, px: 1 }
                }}
              >
                <MenuItem value="newest" sx={{ fontSize: '0.8rem' }}>Newest first</MenuItem>
                <MenuItem value="oldest" sx={{ fontSize: '0.8rem' }}>Oldest first</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f1f5f9',
              border: 'none',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'primary.light' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1 }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined style={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            )
          }}
        />

        <Stack direction="row" spacing={0.75}>
          {STATUS_FILTERS.map(f => {
            const selected = statusFilter === f.value;
            const count = f.value === 'all' ? chats.length : chats.filter(c => c.status === f.value).length;
            return (
              <Chip
                key={f.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{f.label}</span>
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        px: 0.5,
                        py: 0.15,
                        borderRadius: 0.75,
                        bgcolor: selected ? 'rgba(255,255,255,0.3)' : `${f.color}20`,
                        color: selected ? 'white' : f.color,
                      }}
                    >
                      {count}
                    </Box>
                  </Box>
                }
                size="small"
                onClick={() => onStatusFilterChange && onStatusFilterChange(f.value)}
                variant="outlined"
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  borderColor: f.color,
                  color: selected ? 'white' : f.color,
                  bgcolor: selected ? f.color : 'transparent',
                  '& .MuiChip-label': { px: 0.75 },
                  '&:hover': {
                    bgcolor: selected ? f.color : `${f.color}18`,
                  }
                }}
              />
            );
          })}
        </Stack>

      </Box>

      <Divider />

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
              {searchQuery || statusFilter !== 'all' ? 'No conversations found' : 'No conversations yet'}
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
                      fontWeight: 500,
                      color: 'text.primary',
                      fontSize: '0.9rem'
                    }}
                  >
                    {chat.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.disabled',
                      fontWeight: 400,
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
                      maxWidth: '220px',
                      fontWeight: 400,
                      color: 'text.secondary',
                      fontSize: '0.8rem'
                    }}
                  >
                    {chat.lastMessage}
                  </Typography>
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
