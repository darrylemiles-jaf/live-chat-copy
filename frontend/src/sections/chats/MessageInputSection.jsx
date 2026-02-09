import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Stack
} from '@mui/material';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';

const MessageInputSection = ({ message, onMessageChange, onSendMessage, onKeyPress }) => {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <IconButton
          color="primary"
          size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <PaperClipOutlined />
        </IconButton>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={onKeyPress}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={onSendMessage}
          disabled={!message.trim()}
          sx={{
            bgcolor: message.trim() ? 'primary.main' : 'action.disabledBackground',
            color: 'white',
            '&:hover': {
              bgcolor: message.trim() ? 'primary.dark' : 'action.disabledBackground'
            },
            '&.Mui-disabled': {
              color: 'action.disabled'
            }
          }}
        >
          <SendOutlined />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default MessageInputSection;
