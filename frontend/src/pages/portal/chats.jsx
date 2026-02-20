import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, CircularProgress, Typography,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Snackbar, Alert
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ChatListSection from '../../sections/chats/ChatListSection';
import ChatHeaderSection from '../../sections/chats/ChatHeaderSection';
import MessagesAreaSection from '../../sections/chats/MessagesAreaSection';
import MessageInputSection from '../../sections/chats/MessageInputSection';
import EmptyStateSection from '../../sections/chats/EmptyStateSection';
import { getChats, getChatMessages, sendMessage, endChat } from '../../api/chatApi';
import socketService from '../../services/socketService';
import useAuth from '../../hooks/useAuth';
import { SOCKET_URL } from '../../constants/constants';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: `Chats` }
];

// Helper functions
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const transformChatData = (chat) => {
  return {
    id: chat.id,
    name: chat.client?.name || chat.client_name || `User ${chat.client_id}`,
    lastMessage: chat.last_message || chat.messages?.[chat.messages.length - 1]?.message || 'No messages yet',
    timestamp: formatTimestamp(chat.updated_at || chat.created_at),
    avatar: null, // Can be updated if you have avatars
    unread: 0, // Can be calculated if you track read status
    online: chat.status === 'active',
    status: chat.status
  };
};

const transformMessageData = (message, agentId) => {
  return {
    id: message.id,
    sender: message.sender_id === agentId ? 'You' : message.sender_name || `User ${message.sender_id}`,
    message: message.message,
    timestamp: formatTimestamp(message.created_at),
    isSender: message.sender_id === agentId,
    isBot: message.sender_role === 'bot'
  };
};

const Chats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false });

  // Snackbar / feedback state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLoggedIn) {
      console.warn('User not logged in, redirecting to login');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const fetchChatsData = useCallback(async () => {
    if (!user?.id) {
      console.warn('No user ID available');
      return;
    }

    try {
      setLoading(true);
      const response = await getChats(user.id);
      const transformedChats = response.data.map(transformChatData);
      setChats(transformedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId || !user?.id) return;

    try {
      const response = await getChatMessages(chatId);
      const transformedMessages = response.data.map(msg => transformMessageData(msg, user.id));
      setCurrentMessages(transformedMessages);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setCurrentMessages([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    fetchChatsData();

    const socket = socketService.connect(SOCKET_URL, user.id);

    const handleNewMessage = (messageData) => {
      console.log('📨 New message received in chats:', messageData);

      setCurrentMessages(prev => {
        if (selectedChatRef.current && messageData.chat_id === selectedChatRef.current.id) {
          const transformedMessage = transformMessageData(messageData, user.id);

          // If this is our own message echoed back, replace the optimistic placeholder
          if (transformedMessage.isSender) {
            const optimisticIdx = prev.findIndex(m => m.id?.toString().startsWith('optimistic-'));
            if (optimisticIdx !== -1) {
              const updated = [...prev];
              updated[optimisticIdx] = transformedMessage;
              setTimeout(scrollToBottom, 100);
              return updated;
            }
          }

          // Deduplicate by real ID
          if (prev.some(msg => msg.id === transformedMessage.id)) {
            console.log('⚠️ Duplicate message detected, skipping:', messageData.id);
            return prev;
          }
          setTimeout(scrollToBottom, 100);
          return [...prev, transformedMessage];
        }
        return prev;
      });

      fetchChatsData();
    };

    const handleChatAssigned = (chatData) => {
      console.log('✅ Chat assigned in chats:', chatData);
      fetchChatsData();
    };

    const handleChatStatus = (data) => {
      console.log('🔄 Chat status updated:', data);
      fetchChatsData();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('chat_assigned', handleChatAssigned);
    socket.on('chat_status_update', handleChatStatus);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('chat_assigned', handleChatAssigned);
      socket.off('chat_status_update', handleChatStatus);
    };
  }, [user?.id, fetchChatsData]);

  const handleSelectChat = async (chat) => {
    if (selectedChat) {
      const socket = socketService.connect();
      socket.emit('leave_chat', selectedChat.id);
    }

    setSelectedChat(chat);
    await fetchMessages(chat.id);

    const socket = socketService.connect();
    socket.emit('join_chat', chat.id);
    console.log(`Joined chat room: ${chat.id}`);
  };

  useEffect(() => {
    if (location.state?.chatId && chats.length > 0) {
      console.log('🔍 Looking for chat:', location.state.chatId, 'in', chats.length, 'chats');
      const chat = chats.find(c => c.id === location.state.chatId);
      if (chat) {
        console.log('✅ Found chat, selecting:', chat);
        handleSelectChat(chat);
      } else {
        console.warn('⚠️ Chat not found in list, will retry after refresh');
        setTimeout(() => fetchChatsData(), 500);
      }
    }
  }, [location.state, chats]);

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user?.id) return;

    const messageText = message.trim();
    setMessage('');

    // Optimistically add message to the UI immediately
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      sender: 'You',
      message: messageText,
      timestamp: 'Just now',
      isSender: true
    };
    setCurrentMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      await sendMessage(user.id, messageText, selectedChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on failure
      setCurrentMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessage(messageText);
      showSnackbar('Failed to send message. Please try again.', 'error');
    }
  };

  const handleEndChat = () => {
    if (!selectedChat) return;
    setConfirmDialog({ open: true, loading: false });
  };

  const handleConfirmEnd = async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await endChat(selectedChat.id);
      setConfirmDialog({ open: false, loading: false });
      setSelectedChat(null);
      setCurrentMessages([]);
      fetchChatsData();
      showSnackbar('Conversation ended successfully.', 'success');
    } catch (error) {
      console.error('Error ending chat:', error);
      setConfirmDialog({ open: false, loading: false });
      showSnackbar('Failed to end conversation. Please try again.', 'error');
    }
  };

  const handleCancelEnd = () => {
    setConfirmDialog({ open: false, loading: false });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <React.Fragment>
        <Breadcrumbs
          heading="Chats"
          links={breadcrumbLinks}
          subheading="View and manage your chats here."
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Chats"
        links={breadcrumbLinks}
        subheading="View and manage your chats here."
      />

      <Paper
        sx={{
          height: { xs: 'calc(100vh - 150px)', md: 'calc(100vh - 200px)' },
          display: 'flex',
          overflow: 'hidden',
          mt: 2
        }}
      >
        <ChatListSection
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Box
          sx={{
            flex: 1,
            display: { xs: selectedChat ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            width: { xs: '100%', md: 'auto' }
          }}
        >
          {selectedChat ? (
            <>
              <ChatHeaderSection
                selectedChat={selectedChat}
                onBack={handleBackToList}
                onEndChat={handleEndChat}
              />
              <MessagesAreaSection messages={currentMessages} messagesEndRef={messagesEndRef} />
              {selectedChat.status !== 'ended' ? (
                <MessageInputSection
                  message={message}
                  onMessageChange={setMessage}
                  onSendMessage={handleSendMessage}
                  onKeyPress={handleKeyPress}
                />
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.disabledBackground',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    This conversation has ended
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <EmptyStateSection />
          )}
        </Box>
      </Paper>

      {/* End Chat Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelEnd}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>End Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCancelEnd} variant="outlined" disabled={confirmDialog.loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmEnd}
            variant="contained"
            color="error"
            disabled={confirmDialog.loading}
          >
            {confirmDialog.loading ? 'Ending…' : 'End Chat'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </React.Fragment>
  );
};

export default Chats;