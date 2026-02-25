import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Stack,
  Tooltip,
  Zoom,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import { SendOutlined, PaperClipOutlined, SmileOutlined, CloseOutlined, ThunderboltOutlined } from '@ant-design/icons';

const getQuickReplies = (userName) => [
  { label: 'Greeting', text: `Hi, I'm ${userName || 'your agent'} — how can I help you today?` },
  { label: 'Welcome', text: 'Thank you for reaching out! How can I assist you?' },
  { label: 'One moment', text: 'Please hold on while I check that for you.' },
  { label: 'More info', text: 'Could you please provide more details so I can better assist you?' },
  { label: 'Looking into it', text: "I'll look into that for you right away." },
  { label: 'Apology', text: "I'm sorry to hear that. Let me help resolve this for you." },
  { label: 'Anything else', text: 'Is there anything else I can help you with?' },
  { label: 'Closing', text: 'Thank you for contacting us. Have a great day!' },
];

const MessageInputSection = ({
  message,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onFileUpload,
  isUploading = false,
  userName = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [quickRepliesAnchor, setQuickRepliesAnchor] = useState(null);
  const fileInputRef = useRef(null);

  const handleOpenQuickReplies = (e) => setQuickRepliesAnchor(e.currentTarget);
  const handleCloseQuickReplies = () => setQuickRepliesAnchor(null);

  const handleSelectQuickReply = (text) => {
    onMessageChange(text);
    handleCloseQuickReplies();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'File size must be less than 10MB', severity: 'error' });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (selectedFile && onFileUpload) {
      onFileUpload(selectedFile, message);
      clearFile();
    } else {
      onSendMessage();
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('video/')) return '🎬';
    if (type?.startsWith('audio/')) return '🎵';
    if (type?.includes('zip') || type?.includes('rar') || type?.includes('7z')) return '📦';
    return '📄';
  };

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
      {/* File Preview */}
      {selectedFile && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.5,
            bgcolor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          {filePreview ? (
            <Box
              component="img"
              src={filePreview}
              alt="Preview"
              sx={{
                width: 56,
                height: 56,
                objectFit: 'cover',
                borderRadius: 1.5
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                borderRadius: 1.5,
                fontSize: 24
              }}
            >
              {getFileIcon(selectedFile.type)}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={clearFile}
            sx={{
              bgcolor: '#fee2e2',
              color: '#dc2626',
              '&:hover': { bgcolor: '#fecaca' }
            }}
          >
            <CloseOutlined style={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
        />
        {/* Quick Replies Button */}
        <Tooltip title="Quick replies">
          <IconButton
            color="default"
            size="small"
            onClick={handleOpenQuickReplies}
            sx={{
              color: quickRepliesAnchor ? 'primary.main' : '#64748b',
              '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
            }}
          >
            <ThunderboltOutlined />
          </IconButton>
        </Tooltip>

        {/* Quick Replies Popover */}
        <Popover
          open={Boolean(quickRepliesAnchor)}
          anchorEl={quickRepliesAnchor}
          onClose={handleCloseQuickReplies}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 360,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              ⚡ Quick Replies
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click to insert into message
            </Typography>
          </Box>
          <List dense disablePadding sx={{ overflowY: 'auto' }}>
            {getQuickReplies(userName).map((reply, index) => (
              <React.Fragment key={reply.label}>
                <ListItemButton
                  onClick={() => handleSelectQuickReply(reply.text)}
                  sx={{
                    px: 2,
                    py: 1,
                    '&:hover': { bgcolor: 'primary.lighter' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {reply.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.primary" sx={{ mt: 0.25, lineHeight: 1.4 }}>
                        {reply.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
                {index < getQuickReplies(userName).length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Popover>

        <Tooltip title="Attach file">
          <IconButton
            color="default"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            sx={{
              color: selectedFile ? 'primary.main' : '#64748b',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'primary.lighter'
              }
            }}
          >
            <PaperClipOutlined />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
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

        <Zoom in={message.trim().length > 0 || selectedFile !== null}>
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={(!message.trim() && !selectedFile) || isUploading}
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
            {isUploading ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              <SendOutlined style={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Zoom>

        {!message.trim() && !selectedFile && (
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessageInputSection;
