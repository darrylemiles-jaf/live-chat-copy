import React from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';
import { RobotOutlined } from '@ant-design/icons';

const MessagesAreaSection = ({ messages, messagesEndRef }) => {
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
              maxWidth: { xs: '92%', sm: '75%', md: '65%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isSender ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.isBot && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4, px: 1 }}>
                <RobotOutlined style={{ fontSize: 11, color: '#3B7080' }} />
                <Typography variant="caption" sx={{ color: '#3B7080', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Automated Reply
                </Typography>
              </Box>
            )}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: msg.isSender ? 'primary.main' : msg.isBot ? '#EEF7F6' : 'grey.200',
                color: msg.isSender ? 'white' : 'text.primary',
                borderRadius: 2,
                border: msg.isBot ? '1.5px dashed #B3E7E3' : 'none',
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
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessagesAreaSection;
