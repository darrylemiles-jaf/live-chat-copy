import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  GlobalStyles
} from '@mui/material';
import { SendOutlined, PaperClipOutlined, SmileOutlined, CloseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import PlaceholderExtension from '@tiptap/extension-placeholder';

const COMMON_EMOJIS = [
  '😊', '😂', '😍', '🥰', '😎', '🤔', '😅', '😢',
  '👍', '👋', '🙏', '💪', '🤝', '❤️', '🔥', '⭐',
  '✅', '❌', '⚠️', '💡', '📌', '🎉', '🚀', '💯',
];

const RICH_TEXT_EDITOR_STYLES = (
  <GlobalStyles
    styles={{
      '.rte-wrapper .ProseMirror': {
        outline: 'none',
        padding: '6px 2px',
        minHeight: '28px',
        maxHeight: '120px',
        overflowY: 'auto',
        fontSize: '0.95rem',
        lineHeight: 1.55,
        wordBreak: 'break-word',
        '& p': { margin: 0 },
        '& p + p': { marginTop: '4px' },
        '& strong': { fontWeight: 700 },
        '& em': { fontStyle: 'italic' },
        '& s': { textDecoration: 'line-through' },
        '& code': {
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.07)',
          padding: '1px 4px',
          borderRadius: 3,
          fontSize: '0.875em',
        },
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { borderRadius: 4, background: 'rgba(0,0,0,0.18)' },
      },
      '.rte-wrapper .ProseMirror p.is-editor-empty:first-child::before': {
        content: 'attr(data-placeholder)',
        float: 'left',
        color: '#94a3b8',
        pointerEvents: 'none',
        height: 0,
      },
    }}
  />
);

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
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const fileInputRef = useRef(null);

  // Forward-ref handleSend so Tiptap keyboard handler has access to latest version
  const handleSendRef = useRef(null);

  const handleOpenQuickReplies = (e) => setQuickRepliesAnchor(e.currentTarget);
  const handleCloseQuickReplies = () => setQuickRepliesAnchor(null);

  const handleOpenEmoji = (e) => setEmojiAnchor(e.currentTarget);
  const handleCloseEmoji = () => setEmojiAnchor(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      PlaceholderExtension.configure({
        placeholder: 'Type your message…',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? '' : editor.getHTML();
      onMessageChange(html);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      handleKeyDown: (_view, event) => {
        // Enter = send, Shift+Enter = newline
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          handleSendRef.current?.();
          return true;
        }
        return false;
      },
      attributes: { class: 'rte-content' },
    },
  });

  // Sync external clear (e.g. after message sent)
  useEffect(() => {
    if (message === '' && editor && !editor.isEmpty) {
      editor.commands.clearContent();
    }
  }, [message, editor]);

  const handleSelectQuickReply = (text) => {
    if (editor) {
      editor.commands.setContent(`<p>${text}</p>`);
      editor.commands.focus('end');
    }
    handleCloseQuickReplies();
  };

  const handleInsertEmoji = (emoji) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
    handleCloseEmoji();
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

  const handleSend = useCallback(() => {
    if (selectedFile && onFileUpload) {
      onFileUpload(selectedFile, message);
      clearFile();
    } else {
      onSendMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, message, onFileUpload, onSendMessage]);

  // Keep ref in sync so Tiptap key handler has latest
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

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
        bgcolor: 'background.paper',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)'
      }}
    >
      {/* File Preview */}
      {selectedFile && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.5,
            bgcolor: 'action.hover',
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
              bgcolor: 'error.lighter',
              color: 'error.main',
              '&:hover': { bgcolor: 'error.light' }
            }}
          >
            <CloseOutlined style={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      {RICH_TEXT_EDITOR_STYLES}

      {/* Formatting toolbar */}
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75, px: 0.5 }}>
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton
            size="small"
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}
            sx={{
              width: 28, height: 28,
              bgcolor: editor?.isActive('bold') ? 'primary.lighter' : 'transparent',
              color: editor?.isActive('bold') ? 'primary.main' : 'text.secondary',
              fontWeight: 800, fontSize: '13px', fontFamily: 'serif',
              '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' }
            }}
          >
            B
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic (Ctrl+I)">
          <IconButton
            size="small"
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}
            sx={{
              width: 28, height: 28,
              bgcolor: editor?.isActive('italic') ? 'primary.lighter' : 'transparent',
              color: editor?.isActive('italic') ? 'primary.main' : 'text.secondary',
              fontStyle: 'italic', fontWeight: 600, fontSize: '13px', fontFamily: 'serif',
              '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' }
            }}
          >
            I
          </IconButton>
        </Tooltip>
        <Tooltip title="Strikethrough">
          <IconButton
            size="small"
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleStrike().run(); }}
            sx={{
              width: 28, height: 28,
              bgcolor: editor?.isActive('strike') ? 'primary.lighter' : 'transparent',
              color: editor?.isActive('strike') ? 'primary.main' : 'text.secondary',
              textDecoration: 'line-through', fontWeight: 600, fontSize: '13px',
              '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' }
            }}
          >
            S
          </IconButton>
        </Tooltip>
        <Tooltip title="Code">
          <IconButton
            size="small"
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleCode().run(); }}
            sx={{
              width: 28, height: 28,
              bgcolor: editor?.isActive('code') ? 'primary.lighter' : 'transparent',
              color: editor?.isActive('code') ? 'primary.main' : 'text.secondary',
              fontFamily: 'monospace', fontSize: '11px',
              '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' }
            }}
          >
            {'</>'}
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-end"
        sx={{
          p: 1,
          borderRadius: 3,
          bgcolor: isFocused ? 'action.selected' : 'action.hover',
          border: '1px solid',
          borderColor: isFocused ? 'primary.light' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': { bgcolor: 'action.selected' }
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
              color: quickRepliesAnchor ? 'primary.main' : 'text.secondary',
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
              width: 320, maxHeight: 360, borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">⚡ Quick Replies</Typography>
            <Typography variant="caption" color="text.secondary">Click to insert into message</Typography>
          </Box>
          <List dense disablePadding sx={{ overflowY: 'auto' }}>
            {getQuickReplies(userName).map((reply, index) => (
              <React.Fragment key={reply.label}>
                <ListItemButton
                  onClick={() => handleSelectQuickReply(reply.text)}
                  sx={{ px: 2, py: 1, '&:hover': { bgcolor: 'primary.lighter' } }}
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
            size="small"
            onClick={() => fileInputRef.current?.click()}
            sx={{
              color: selectedFile ? 'primary.main' : 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
            }}
          >
            <PaperClipOutlined />
          </IconButton>
        </Tooltip>

        {/* Emoji Button */}
        <Tooltip title="Emoji">
          <IconButton
            size="small"
            onClick={handleOpenEmoji}
            sx={{
              color: emojiAnchor ? 'primary.main' : 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
            }}
          >
            <SmileOutlined />
          </IconButton>
        </Tooltip>

        {/* Emoji Popover */}
        <Popover
          open={Boolean(emojiAnchor)}
          anchorEl={emojiAnchor}
          onClose={handleCloseEmoji}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{ sx: { p: 1.5, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}
        >
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Emojis
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5, width: 256 }}>
            {COMMON_EMOJIS.map((emoji) => (
              <IconButton
                key={emoji}
                size="small"
                onClick={() => handleInsertEmoji(emoji)}
                sx={{
                  width: 28, height: 28, fontSize: '16px',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.selected', transform: 'scale(1.2)' },
                  transition: 'transform 0.1s'
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        </Popover>

        {/* Rich Text Editor */}
        <Box
          className="rte-wrapper"
          sx={{ flex: 1, cursor: 'text', minWidth: 0 }}
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent
            editor={editor}
            style={{ outline: 'none' }}
          />
        </Box>

        <Tooltip title="Send (Enter)">
          <span>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={(!message.trim() && !selectedFile) || isUploading}
              sx={{
                width: 40, height: 40,
                bgcolor: message.trim() || selectedFile ? 'primary.main' : 'action.disabledBackground',
                color: message.trim() || selectedFile ? 'white' : 'text.disabled',
                boxShadow: message.trim() || selectedFile ? '0 2px 8px rgba(0, 142, 134, 0.35)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)'
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.disabled'
                }
              }}
            >
              {isUploading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <SendOutlined style={{ fontSize: 18 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
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
