import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getChats,
  getChatMessages,
  sendMessage,
  sendMessageWithAttachment,
  endChat,
} from '../api/chatApi';
import socketService from '../services/socketService';
import useAuth from './useAuth';
import { SOCKET_URL } from '../constants/constants';
import { transformChatData, transformMessageData } from '../utils/chats/chatTransformers';

const useChats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, loading: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);
  const fetchChatsDataRef = useRef(null);
  const fetchMessagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showSnackbar = (msg, severity = 'success') => {
    setSnackbar({ open: true, message: msg, severity });
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Keep selectedChatRef in sync
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      console.warn('User not logged in, redirecting to login');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchChatsData = useCallback(
    async (silent = false) => {
      if (!user?.id) return;

      try {
        if (!silent) setLoading(true);
        const response = await getChats(user.id);
        const transformedChats = response.data.map(transformChatData);
        setChats(transformedChats);

        const socket = socketService.socket;
        if (socket) {
          response.data.forEach((chat) => {
            if (chat.status === 'active' || chat.status === 'queued') {
              socket.emit('join_chat', chat.id);
            }
          });
        }

        if (silent) {
          setSelectedChat((prev) => {
            if (!prev) return prev;
            const updated = response.data.find((c) => c.id === prev.id);
            return updated ? { ...prev, status: updated.status } : prev;
          });
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        if (!silent) setChats([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchChatsDataRef.current = fetchChatsData;
  }, [fetchChatsData]);

  const fetchMessages = useCallback(
    async (chatId, silent = false) => {
      if (!chatId || !user?.id) return;

      try {
        if (!silent) setLoadingMessages(true);
        const response = await getChatMessages(chatId);
        const transformedMessages = response.data.map((msg) =>
          transformMessageData(msg, user.id)
        );
        setCurrentMessages(transformedMessages);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setCurrentMessages([]);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
  }, [fetchMessages]);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const socket = socketService.connect(SOCKET_URL, user.id);

    if (socket.connected) {
      socket.emit('join', user.id);
    }

    fetchChatsData();

    const handleConnect = () => {
      socket.emit('join', user.id);
      fetchChatsDataRef.current?.(true);

      if (selectedChatRef.current) {
        socket.emit('join_chat', selectedChatRef.current.id);
        fetchMessagesRef.current?.(selectedChatRef.current.id, true);
      }
    };

    const handleDisconnect = (reason) => {
      console.warn('Socket disconnected:', reason);
    };

    const handleNewMessage = (messageData) => {
      const msgChatId = Number(messageData.chat_id);
      const currentChatId = selectedChatRef.current
        ? Number(selectedChatRef.current.id)
        : null;

      setCurrentMessages((prev) => {
        if (currentChatId && msgChatId === currentChatId) {
          const transformed = transformMessageData(messageData, user.id);

          if (transformed.isSender) {
            const optimisticIdx = prev.findIndex((m) =>
              m.id?.toString().startsWith('optimistic-')
            );
            if (optimisticIdx !== -1) {
              const updated = [...prev];
              updated[optimisticIdx] = transformed;
              setTimeout(scrollToBottom, 100);
              return updated;
            }
          }

          if (prev.some((m) => m.id === transformed.id)) return prev;

          setTimeout(scrollToBottom, 100);
          return [...prev, transformed];
        }
        return prev;
      });

      fetchChatsDataRef.current?.(true);
    };

    const handleChatAssigned = (chatData) => {
      if (selectedChatRef.current && chatData.id === selectedChatRef.current.id) {
        fetchMessagesRef.current?.(chatData.id, true);
      }
      fetchChatsDataRef.current?.(true);
    };

    const handleChatStatus = () => fetchChatsDataRef.current?.(true);
    const handleQueueUpdate = () => fetchChatsDataRef.current?.(true);

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

  // ── Polling fallback ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedChat || selectedChat.status === 'ended') return;

    const pollInterval = setInterval(() => {
      fetchMessagesRef.current?.(selectedChat.id, true);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedChat?.id, selectedChat?.status]);

  // ── Navigate to chat from location state ──────────────────────────────────
  useEffect(() => {
    if (location.state?.chatId && chats.length > 0) {
      const chat = chats.find((c) => c.id === location.state.chatId);
      if (chat) {
        handleSelectChat(chat);
      } else {
        setTimeout(() => fetchChatsData(), 500);
      }
    }
  }, [location.state, chats]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectChat = async (chat) => {
    if (chat.status === 'queued') {
      navigate('/portal/queue', { state: { queueId: chat.id } });
      return;
    }

    const socket = socketService.socket;

    if (selectedChat && socket) {
      socket.emit('leave_chat', selectedChat.id);
    }

    setSelectedChat(chat);

    if (socket) {
      socket.emit('join_chat', chat.id);
    }

    await fetchMessages(chat.id);
  };

  const handleBackToList = () => setSelectedChat(null);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user?.id) return;

    const messageText = message.trim();
    setMessage('');

    const socket = socketService.socket;
    if (socket) socket.emit('stop_typing', { chatId: selectedChat.id });

    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      sender: 'You',
      message: messageText,
      timestamp: 'Just now',
      isSender: true,
    };
    setCurrentMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      await sendMessage(user.id, messageText, selectedChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setMessage(messageText);
      showSnackbar('Failed to send message. Please try again.', 'error');
    }
  };

  const handleFileUpload = async (file, messageText = '') => {
    if (!selectedChat || !user?.id) return;

    setIsUploading(true);
    setMessage('');

    const socket = socketService.socket;
    if (socket) socket.emit('stop_typing', { chatId: selectedChat.id });

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      sender: 'You',
      message: messageText || '',
      attachment_name: file.name,
      attachment_type: file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
            ? 'audio'
            : file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')
              ? 'archive'
              : 'document',
      attachment_url: previewUrl,
    };
    setCurrentMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      await sendMessageWithAttachment(user.id, file, messageText, selectedChat.id);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      setCurrentMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      showSnackbar('Failed to upload file. Please try again.', 'error');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;

    const socket = socketService.socket;
    if (socket) {
      socket.emit('typing', {
        chatId: selectedChat.id,
        userName: user?.name || 'Agent',
        role: 'agent',
      });

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
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
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

  const handleCancelEnd = () => setConfirmDialog({ open: false, loading: false });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    // State
    chats,
    selectedChat,
    message,
    searchQuery,
    statusFilter,
    currentMessages,
    loading,
    loadingMessages,
    isTyping,
    typingUser,
    isUploading,
    confirmDialog,
    snackbar,
    // Refs
    messagesEndRef,
    // Setters
    setMessage,
    setSearchQuery,
    setStatusFilter,
    // Handlers
    handleSelectChat,
    handleBackToList,
    handleSendMessage,
    handleFileUpload,
    handleTyping,
    handleEndChat,
    handleConfirmEnd,
    handleCancelEnd,
    handleKeyPress,
    handleSnackbarClose,
    // User
    user,
  };
};

export default useChats;
