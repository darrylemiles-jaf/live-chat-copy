import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, CircularProgress, Typography, Grid,
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
import { getChats, getChatMessages, sendMessage, sendMessageWithAttachment, endChat } from '../../api/chatApi';
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
    rawTimestamp: new Date(chat.updated_at || chat.created_at).getTime(),
    avatar: null,
    unread: 0,
    online: chat.status === 'active',
    status: chat.status,
    email: chat.client?.email || chat.client_email || null,
    username: chat.client?.username || null,
    client_id: chat.client_id,
    agent_name: chat.agent?.name || null,
    created_at: chat.created_at,
    updated_at: chat.updated_at,
    message_count: chat.messages?.length || 0
  };
};

const transformMessageData = (message, agentId) => {
  return {
    id: message.id,
    sender: message.sender_id === agentId ? 'You' : message.sender_name || `User ${message.sender_id}`,
    message: message.message,
    timestamp: formatTimestamp(message.created_at),
    isSender: message.sender_id === agentId,
    isBot: message.sender_role === 'bot',
    attachment_url: message.attachment_url,
    attachment_type: message.attachment_type,
    attachment_name: message.attachment_name
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
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(true); // only true on first load
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);
  const fetchChatsDataRef = useRef(null);
  const fetchMessagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false });

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

  const fetchChatsData = useCallback(async (silent = false) => {
    if (!user?.id) {
      console.warn('No user ID available');
      return;
    }

    try {
      if (!silent) setLoading(true);
      console.log(`📥 Fetching chats for user ${user.id}${silent ? ' (silent)' : ''}...`);
      const response = await getChats(user.id);
      const transformedChats = response.data.map(transformChatData);
      console.log(`✅ Fetched ${transformedChats.length} chats`);
      setChats(transformedChats);
      const socket = socketService.socket;
      if (socket) {
        response.data.forEach(chat => {
          if (chat.status === 'active' || chat.status === 'queued') {
            socket.emit('join_chat', chat.id);
          }
        });
      }

      if (silent) {
        setSelectedChat(prev => {
          if (!prev) return prev;
          const updated = response.data.find(c => c.id === prev.id);
          return updated ? { ...prev, status: updated.status } : prev;
        });
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      if (!silent) setChats([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user?.id]);
  useEffect(() => {
    fetchChatsDataRef.current = fetchChatsData;
  }, [fetchChatsData]);

  const fetchMessages = useCallback(async (chatId, silent = false) => {
    if (!chatId || !user?.id) return;

    try {
      if (!silent) {
        setLoadingMessages(true);
        console.log(`💬 Fetching messages for chat ${chatId}...`);
      }
      const response = await getChatMessages(chatId);
      const transformedMessages = response.data.map(msg => transformMessageData(msg, user.id));
      if (!silent) {
        console.log(`✅ Loaded ${transformedMessages.length} messages for chat ${chatId}`);
      }
      setCurrentMessages(transformedMessages);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setCurrentMessages([]);
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
  }, [fetchMessages]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = socketService.connect(SOCKET_URL, user.id);

    console.log(`🔧 Portal socket setup for user ${user.id}:`, {
      socketId: socket.id,
      connected: socket.connected,
      url: SOCKET_URL
    });

    if (socket.connected) {
      socket.emit('join', user.id);
      console.log(`👤 Explicitly joined personal room for user ${user.id}`);
    }

    fetchChatsData();

    const handleConnect = () => {
      console.log('🔌 Socket (re)connected — rejoining personal room and all chat rooms');
      socket.emit('join', user.id);
      console.log(`👤 Rejoined personal room for user ${user.id}`);

      fetchChatsDataRef.current?.(true);

      if (selectedChatRef.current) {
        console.log(`🔄 Rejoining chat room and refetching messages for chat ${selectedChatRef.current.id}`);
        socket.emit('join_chat', selectedChatRef.current.id);
        fetchMessagesRef.current?.(selectedChatRef.current.id, true);
      }
    };

    const handleDisconnect = (reason) => {
      console.warn('❌ Socket disconnected:', reason);
    };

    const handleNewMessage = (messageData) => {
      const msgChatId = Number(messageData.chat_id);
      const currentChatId = selectedChatRef.current ? Number(selectedChatRef.current.id) : null;

      console.log('📨 New message received:', {
        messageId: messageData.id,
        msgChatId,
        currentChatId,
        isForCurrentChat: msgChatId === currentChatId,
        senderRole: messageData.sender_role,
        senderId: messageData.sender_id,
        message: messageData.message?.substring(0, 50)
      });

      setCurrentMessages(prev => {
        if (currentChatId && msgChatId === currentChatId) {
          const transformedMessage = transformMessageData(messageData, user.id);
          console.log(`✅ Adding message to UI: "${messageData.message?.substring(0, 30)}..."`);

          if (transformedMessage.isSender) {
            const optimisticIdx = prev.findIndex(m => m.id?.toString().startsWith('optimistic-'));
            if (optimisticIdx !== -1) {
              console.log('🔄 Replacing optimistic message with server response');
              const updated = [...prev];
              updated[optimisticIdx] = transformedMessage;
              setTimeout(scrollToBottom, 100);
              return updated;
            }
          }

          if (prev.some(msg => msg.id === transformedMessage.id)) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }
          setTimeout(scrollToBottom, 100);
          return [...prev, transformedMessage];
        } else {
          console.log('⏭️ Message not for current chat (or no chat selected), will refresh list');
        }
        return prev;
      });

      fetchChatsDataRef.current?.(true);
    };

    const handleChatAssigned = (chatData) => {
      console.log('✅ Chat assigned:', chatData);
      console.log('🔄 Refreshing chat list after assignment...');

      if (selectedChatRef.current && chatData.id === selectedChatRef.current.id) {
        console.log('🔄 Refetching messages for currently open chat after assignment');
        fetchMessagesRef.current?.(chatData.id, true);
      }

      fetchChatsDataRef.current?.(true);
    };

    const handleChatStatus = (data) => {
      console.log('🔄 Chat status updated:', data);
      console.log('🔄 Refreshing chat list after status update...');
      fetchChatsDataRef.current?.(true);
    };

    const handleQueueUpdate = (data) => {
      console.log('📋 Queue update received in chats:', data);
      console.log('🔄 Refreshing chat list after queue update...');
      fetchChatsDataRef.current?.(true);
    };

    const handleUserTyping = ({ userName, role }) => {
      if (role === 'agent') return;
      if (selectedChatRef.current) {
        setTypingUser(userName || 'User');
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = () => {
      setIsTyping(false);
      setTypingUser('');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('chat_assigned', handleChatAssigned);
    socket.on('chat_status_update', handleChatStatus);
    socket.on('queue_update', handleQueueUpdate);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('chat_assigned', handleChatAssigned);
      socket.off('chat_status_update', handleChatStatus);
      socket.off('queue_update', handleQueueUpdate);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [user?.id]);
  useEffect(() => {
    if (!selectedChat || selectedChat.status === 'ended') return;

    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for new messages...');
      fetchMessagesRef.current?.(selectedChat.id, true);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [selectedChat?.id, selectedChat?.status]);

  const handleSelectChat = async (chat) => {
    if (chat.status === 'queued') {
      navigate('/portal/queue', { state: { queueId: chat.id } });
      return;
    }

    console.log(`🎯 Selecting chat ${chat.id} (${chat.name})`);
    const socket = socketService.socket;

    if (selectedChat && socket) {
      console.log(`👋 Leaving previous chat room: ${selectedChat.id}`);
      socket.emit('leave_chat', selectedChat.id);
    }

    setSelectedChat(chat);

    if (socket) {
      socket.emit('join_chat', chat.id);
      console.log(`🚪 Joined chat room: chat_${chat.id}`);
    }

    await fetchMessages(chat.id);
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

    // Stop typing indicator when sending
    const socket = socketService.socket;
    if (socket && selectedChat) {
      socket.emit('stop_typing', { chatId: selectedChat.id });
    }

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
      setCurrentMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessage(messageText);
      showSnackbar('Failed to send message. Please try again.', 'error');
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file, messageText = '') => {
    if (!selectedChat || !user?.id) return;

    setIsUploading(true);
    setMessage('');

    const socket = socketService.socket;
    if (socket && selectedChat) {
      socket.emit('stop_typing', { chatId: selectedChat.id });
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      sender: 'You',
      message: messageText || '',
      attachment_name: file.name,
      attachment_type: file.type.startsWith('image/') ? 'image' :
        file.type.startsWith('video/') ? 'video' :
          file.type.startsWith('audio/') ? 'audio' :
            (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) ? 'archive' : 'document',
      attachment_url: previewUrl, 
    };
    setCurrentMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      await sendMessageWithAttachment(user.id, file, messageText, selectedChat.id);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setCurrentMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      showSnackbar('Failed to upload file. Please try again.', 'error');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;

    const socket = socketService.socket;
    if (socket) {
      socket.emit('typing', { chatId: selectedChat.id, userName: user?.name || 'Agent', role: 'agent' });

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId: selectedChat.id });
      }, 3000);
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
      setStatusFilter('queued');
      fetchChatsData();
      showSnackbar('Conversation ended successfully.', 'success');
      navigate('/portal/queue');
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
          overflow: 'hidden',
          mt: 2
        }}
      >
        <Grid container sx={{ height: '100%' }}>
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              height: '100%',
              borderRight: 1,
              borderColor: 'divider'
            }}
          >
            <ChatListSection
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: { xs: selectedChat ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              height: '100%',
              minWidth: 0
            }}
          >
            {selectedChat ? (
              <>
                <ChatHeaderSection
                  selectedChat={selectedChat}
                  onBack={handleBackToList}
                  onEndChat={handleEndChat}
                />
                <MessagesAreaSection
                  messages={currentMessages}
                  messagesEndRef={messagesEndRef}
                  isLoading={loadingMessages}
                  isTyping={isTyping}
                  typingUser={typingUser}
                />
                {selectedChat.status !== 'ended' ? (
                  <MessageInputSection
                    message={message}
                    onMessageChange={(value) => {
                      setMessage(value);
                      handleTyping();
                    }}
                    onSendMessage={handleSendMessage}
                    onKeyPress={handleKeyPress}
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                    userName={user?.name}
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
          </Grid>

          {selectedChat && (
            <Grid
              size={{ xs: 0, md: 3 }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                height: '100%',
                borderLeft: 1,
                borderColor: 'divider',
                bgcolor: '#fafbfc',
                overflow: 'auto'
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Client Details
                </Typography>
              </Box>

              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: 'white',
                      mb: 1
                    }}
                  >
                    {selectedChat.name.charAt(0).toUpperCase()}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} textAlign="center">
                    {selectedChat.name}
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor:
                        selectedChat.status === 'active' ? '#dcfce7' :
                        selectedChat.status === 'queued' ? '#fef3c7' : '#f1f5f9',
                      color:
                        selectedChat.status === 'active' ? '#16a34a' :
                        selectedChat.status === 'queued' ? '#d97706' : '#64748b'
                    }}
                  >
                    {selectedChat.status.charAt(0).toUpperCase() + selectedChat.status.slice(1)}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Contact Info
                  </Typography>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Email</Typography>
                    <Typography variant="body2" fontSize="0.8rem" sx={{ wordBreak: 'break-all' }}>
                      {selectedChat.email || '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Username</Typography>
                    <Typography variant="body2" fontSize="0.8rem">
                      {selectedChat.username || '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Client ID</Typography>
                    <Typography variant="body2" fontSize="0.8rem">#{selectedChat.client_id}</Typography>
                  </Box>
                </Box>

                <Box sx={{ height: 1, bgcolor: 'divider' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Chat Info
                  </Typography>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Chat ID</Typography>
                    <Typography variant="body2" fontSize="0.8rem">#{selectedChat.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Started</Typography>
                    <Typography variant="body2" fontSize="0.8rem">
                      {selectedChat.created_at ? new Date(selectedChat.created_at).toLocaleString() : selectedChat.timestamp}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Last Activity</Typography>
                    <Typography variant="body2" fontSize="0.8rem">{selectedChat.timestamp}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled">Messages</Typography>
                    <Typography variant="body2" fontSize="0.8rem">{currentMessages.length}</Typography>
                  </Box>
                  {selectedChat.agent_name && (
                    <Box>
                      <Typography variant="caption" color="text.disabled">Assigned Agent</Typography>
                      <Typography variant="body2" fontSize="0.8rem">{selectedChat.agent_name}</Typography>
                    </Box>
                  )}
                </Box>

                {selectedChat.status !== 'ended' && (
                  <>
                    <Box sx={{ height: 1, bgcolor: 'divider' }} />
                   
                  </>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

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
            Your status will also be set to "Available". And you will navigate to Queue page 
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