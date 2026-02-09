import React from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Badge,
  Stack
} from '@mui/material';
import { MoreOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const ChatHeaderSection = ({ selectedChat, onBack }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Back button for mobile */}
        <IconButton
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          onClick={onBack}
        >
          <ArrowLeftOutlined />
        </IconButton>

        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: selectedChat.online ? '#44b700' : '#bdbdbd',
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid white'
            }
          }}
        >
          <Avatar src={selectedChat.avatar} alt={selectedChat.name}>
            {selectedChat.name.charAt(0)}
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {selectedChat.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedChat.online ? 'Active now' : `Active ${selectedChat.timestamp} ago`}
          </Typography>
        </Box>
      </Box>
      <Stack direction="row" spacing={1}>
        <IconButton>
          <MoreOutlined />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default ChatHeaderSection;
