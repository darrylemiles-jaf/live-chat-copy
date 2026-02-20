import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Stack,
  Tooltip,
  Zoom
} from '@mui/material';
import { SendOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons';

const MessageInputSection = ({ message, onMessageChange, onSendMessage, onKeyPress }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'white',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-end"
        sx={{
          p: 1,
          borderRadius: 3,
          bgcolor: isFocused ? '#f8fafc' : '#f1f5f9',
          border: '1px solid',
          borderColor: isFocused ? 'primary.light' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#f8fafc'
          }
        }}
      >
        <Tooltip title="Attach file">
          <IconButton
            color="default"
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: '#64748b',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'primary.lighter'
              }
            }}
          >
            <PaperClipOutlined />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add emoji">
          <IconButton
            color="default"
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: '#64748b',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'primary.lighter'
              }
            }}
          >
            <SmileOutlined />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={onKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          variant="standard"
          size="small"
          InputProps={{
            disableUnderline: true,
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.95rem',
              lineHeight: 1.5
            },
            '& .MuiInputBase-input': {
              py: 0.5
            }
          }}
        />

        <Zoom in={message.trim().length > 0}>
          <IconButton
            color="primary"
            onClick={onSendMessage}
            disabled={!message.trim()}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0, 142, 134, 0.35)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)'
              },
              '&.Mui-disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            <SendOutlined style={{ fontSize: 18 }} />
          </IconButton>
        </Zoom>

        {!message.trim() && (
          <IconButton
            disabled
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#e2e8f0',
              color: '#94a3b8'
            }}
          >
            <SendOutlined style={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
};

export default MessageInputSection;
