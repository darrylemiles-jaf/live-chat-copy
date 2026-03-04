import React from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Badge,
  Stack,
  Button,
  Tooltip,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowLeftOutlined, StopOutlined, PhoneOutlined, VideoCameraOutlined } from '@ant-design/icons';

const ChatHeaderSection = ({ selectedChat, onBack, onEndChat, onAvatarClick }) => {
  const theme = useTheme();
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return theme.vars.palette.success.main;
      case 'queued': return theme.vars.palette.warning.main;
      case 'ended': return theme.vars.palette.text.disabled;
      default: return theme.vars.palette.text.disabled;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'queued': return 'In Queue';
      case 'ended': return 'Ended';
      default: return 'Offline';
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        background: theme.vars.palette.background.paper,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Back button for mobile */}
        <IconButton
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' }
          }}
          onClick={onBack}
          size="small"
        >
          <ArrowLeftOutlined />
        </IconButton>

        <Box
          onClick={onAvatarClick}
          sx={{ cursor: onAvatarClick ? 'pointer' : 'default', display: 'inline-flex' }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: getStatusColor(selectedChat.status),
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `2.5px solid ${theme.vars.palette.background.paper}`,
                boxShadow: `0 0 0 2px ${getStatusColor(selectedChat.status)}33`
              }
            }}
          >
            <Avatar
              src={selectedChat.avatar}
              alt={selectedChat.name}
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                fontSize: '1.25rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {selectedChat.name.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              {selectedChat.name}
            </Typography>
            <Chip
              label={getStatusLabel(selectedChat.status)}
              size="small"
              sx={{
                height: 20,
                fontSize: '10px',
                fontWeight: 600,
                bgcolor: `${getStatusColor(selectedChat.status)}15`,
                color: getStatusColor(selectedChat.status),
                border: `1px solid ${getStatusColor(selectedChat.status)}30`,
                '& .MuiChip-label': { px: 1 }
              }}
            />
            {selectedChat.concern && (
              <Chip
                label={selectedChat.concern}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '10px',
                  fontWeight: 600,
                  bgcolor: 'info.lighter',
                  color: 'info.dark',
                  border: '1px solid',
                  borderColor: 'info.light',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {selectedChat.online ? (
              <>
                <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', display: 'inline-block' }} />
                Online now
              </>
            ) : (
              `Last seen ${selectedChat.timestamp}`
            )}
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        {/* End Chat Button */}
        {onEndChat && selectedChat.status !== 'ended' && (
          <>
            <Tooltip title="End Conversation">
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<StopOutlined />}
                onClick={onEndChat}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': {
                    bgcolor: 'error.lighter'
                  }
                }}
              >
                End Chat
              </Button>
            </Tooltip>
            <Tooltip title="End Conversation">
              <IconButton
                color="error"
                onClick={onEndChat}
                size="small"
                sx={{
                  display: { xs: 'inline-flex', sm: 'none' },
                  bgcolor: 'error.lighter',
                  '&:hover': { bgcolor: 'error.light' }
                }}
              >
                <StopOutlined />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ChatHeaderSection;
