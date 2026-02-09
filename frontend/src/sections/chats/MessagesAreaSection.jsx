import React from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';

const MessagesAreaSection = ({ messages }) => {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {messages.map((msg) => (
        <Box
          key={msg.id}
          sx={{
            display: 'flex',
            justifyContent: msg.isSender ? 'flex-end' : 'flex-start',
            mb: 1
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: '85%', sm: '70%', md: '60%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isSender ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: msg.isSender ? 'primary.main' : 'grey.200',
                color: msg.isSender ? 'white' : 'text.primary',
                borderRadius: 2,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              <Typography variant="body2">{msg.message}</Typography>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
              {msg.timestamp}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default MessagesAreaSection;
