import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import WidgetEditor from './WidgetEditor';
import { CHAT_MODES, escalateToAgent } from '../../services/chatService';
import './ChatWidget.css';

const ChatWidget = ({ apiUrl = '', socketUrl = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [queuePosition, setQueuePosition] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [endedChatId, setEndedChatId] = useState(null);
  const [lastSeenAt, setLastSeenAt] = useState(null);
  const [widgetToken, setWidgetToken] = useState(null);
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);

  // ── Quick Chats screen ────────────────────────────────────────────────────
  const [widgetScreen, setWidgetScreen] = useState('quick_chats');
  const [quickChats, setQuickChats] = useState([]);
  const [quickChatsLoading, setQuickChatsLoading] = useState(false);
  const [quickChatSearch, setQuickChatSearch] = useState('');
  const [showAllQCPills, setShowAllQCPills] = useState(false);

  // ── Escalation state ──────────────────────────────────────────────────────
  const [chatMode, setChatMode] = useState(CHAT_MODES.BOT);
  const [escalatedAgentName, setEscalatedAgentName] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const QUICK_REPLIES = ['Hi, I need help!', 'I have an inquiry', 'I want to follow up on something', 'Technical issue'];

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatIdRef = useRef(chatId);
  const widgetTokenRef = useRef(widgetToken);
  const isOpenRef = useRef(isOpen);
  const clientEndedChatRef = useRef(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const escalationPollRef = useRef(null);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    widgetTokenRef.current = widgetToken;
  }, [widgetToken]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const canMarkSeen = () =>
    isOpenRef.current &&
    document.visibilityState === 'visible' &&
    chatIdRef.current &&
    socketRef.current?.connected;

  // When the widget is opened, mark any unread agent messages as seen
  useEffect(() => {
    if (canMarkSeen()) {
      socketRef.current.emit('mark_messages_read', {
        chatId: chatIdRef.current,
        readerRole: 'client'
      });
    }
  }, [isOpen]);

  // When the browser tab becomes visible again, mark pending messages as seen
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (canMarkSeen()) {
        socketRef.current.emit('mark_messages_read', {
          chatId: chatIdRef.current,
          readerRole: 'client'
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isRegistered) return;

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Widget connected to chat server');
      setIsConnected(true);
      if (userId) {
        socketRef.current.emit('join', userId);
        console.log(`👤 Widget joined user room: user_${userId}`);
      }
      if (chatIdRef.current) {
        socketRef.current.emit('join_chat', chatIdRef.current);
        console.log(`💬 Widget joined chat room: chat_${chatIdRef.current}`);
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Widget disconnected from chat server:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('new_message', (message) => {
      const msgChatId = Number(message.chat_id);
      const currentChatId = chatIdRef.current ? Number(chatIdRef.current) : null;

      console.log('📨 Widget received new message:', {
        messageId: message.id,
        msgChatId,
        currentChatId,
        match: msgChatId === currentChatId || !currentChatId,
        senderRole: message.sender_role
      });

      if (msgChatId === currentChatId || !currentChatId) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) {
            console.log('⚠️ Widget: Duplicate message, skipping');
            return prev;
          }
          // Replace optimistic message if this is from the current user
          if (Number(message.sender_id) === Number(userId)) {
            const optimisticIdx = prev.findIndex((m) => m.id?.toString().startsWith('optimistic-'));
            if (optimisticIdx !== -1) {
              const updated = [...prev];
              updated[optimisticIdx] = message;
              console.log('✅ Widget: Replaced optimistic message with real one');
              return updated;
            }
          }
          console.log('✅ Widget: Adding message to UI');
          return [...prev, message];
        });
        scrollToBottom();

        if (message.sender_role !== 'client' && message.sender_role !== 'bot' && canMarkSeen()) {
          socketRef.current?.emit('mark_messages_read', {
            chatId: chatIdRef.current,
            readerRole: 'client'
          });
        }
      } else {
        console.log('⏭️ Widget: Message for different chat, skipping');
      }
    });

    socketRef.current.on('user_typing', ({ userName, role }) => {
      console.log('📝 Widget received user_typing event:', { userName, role, chatId: chatIdRef.current });
      if (role === 'client') {
        console.log('⏭️ Ignoring client typing (self)');
        return;
      }
      console.log('✅ Showing agent typing indicator:', userName);
      setAgentName(userName);
      setIsTyping(true);
    });

    socketRef.current.on('user_stop_typing', () => {
      console.log('⏹️ Widget received user_stop_typing');
      setIsTyping(false);
    });

    socketRef.current.on('messages_seen', ({ chatId: seenChatId, seenAt }) => {
      const cid = chatIdRef.current;
      console.log('👁️ Widget messages_seen event:', { seenChatId, seenAt, cid });
      if (!cid || Number(seenChatId) === Number(cid)) {
        setLastSeenAt(seenAt);
      }
    });

    socketRef.current.on('chat_status_update', ({ chatId: updatedChatId, status }) => {
      console.log('🔄 Widget received chat status update:', { chatId: updatedChatId, status });
      if (updatedChatId === chatIdRef.current) {
        if (status === 'ended') {
          if (!clientEndedChatRef.current) {
            setMessages((prev) => [
              ...prev,
              {
                id: `system-end-${Date.now()}`,
                sender_role: 'bot',
                message: 'The Support agent has ended this chat.',
                created_at: new Date().toISOString(),
                isSystemMsg: true
              }
            ]);
          }
          setIsChatEnded(true);
          setEndedChatId(updatedChatId);
        } else if (status === 'active') {
          setQueuePosition(null);
          setChatMode(CHAT_MODES.LIVE_AGENT);
        }
      }
    });

    socketRef.current.on('queue_position_update', ({ position }) => {
      console.log('🔢 Widget received queue position update:', position);
      setQueuePosition((prev) => {
        if (prev !== null && prev !== position) {
          const posLabel = position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : `${position}th`;
          setMessages((msgs) => [
            ...msgs,
            {
              id: `queue-update-${Date.now()}`,
              sender_role: 'bot',
              message: `Queue update: You are now #${position} in line (${posLabel} in queue). We appreciate your patience! 🙏`,
              created_at: new Date().toISOString(),
              isAutoReply: true
            }
          ]);
        }
        return position;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isRegistered, userId, socketUrl]);

  useEffect(() => {
    if (socketRef.current?.connected && chatId) {
      socketRef.current.emit('join_chat', chatId);
      console.log(`💬 Widget joined new chat room: chat_${chatId}`);
      // If the widget is already open and visible when a chat is loaded, mark agent messages as seen
      if (canMarkSeen()) {
        socketRef.current.emit('mark_messages_read', {
          chatId,
          readerRole: 'client'
        });
      }
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          email: userEmail
        })
      });

      const data = await response.json();
      let userIdToStore;
      let roleToStore = 'client';

      if (!data.success && response.status === 404) {
        const createResponse = await fetch(`${apiUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({
            name: userName,
            username: userEmail.split('@')[0],
            email: userEmail,
            role: 'client',
            password: 'SecurePass123'
          })
        });

        const createData = await createResponse.json();
        userIdToStore = createData.data?.id;
        roleToStore = createData.data?.role || 'client';
        setUserId(userIdToStore);
        console.log('New user created:', userIdToStore, 'role:', roleToStore);
      } else if (data.success) {
        userIdToStore = data.data?.id;
        roleToStore = data.data?.role || 'client';
        setUserId(userIdToStore);
        if (data.token) setWidgetToken(data.token);
        console.log('User logged in:', userIdToStore, 'role:', roleToStore);
      }

      if (!userIdToStore) {
        console.error('Failed to get user ID from response:', data);
        showToast('Failed to register. Please try again.');
        setIsLoading(false);
        return;
      }

      setUserRole(roleToStore);
      setIsRegistered(true);

      localStorage.setItem(
        'chat_widget_user',
        JSON.stringify({
          id: userIdToStore,
          name: userName,
          email: userEmail,
          role: roleToStore,
          token: data.token || null
        })
      );

      console.log('User registered and saved to localStorage:', { id: userIdToStore, name: userName, email: userEmail, role: roleToStore });
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((isEditorEmpty && !selectedFile) || !userId) {
      console.warn('Cannot send message:', { inputMessage, userId });
      return;
    }

    const messagePayload = {
      sender_id: userId,
      message: inputMessage.trim()
    };

    if (chatId) {
      messagePayload.chat_id = chatId;
    }

    console.log('Sending message:', messagePayload);

    try {
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(widgetToken ? { Authorization: `Bearer ${widgetToken}` } : {})
        },
        body: JSON.stringify(messagePayload)
      });

      const data = await response.json();
      console.log('Message response:', data);

      if (data.success) {
        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);

          if (data.data) {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === data.data.id)) return prev;
              return [...prev, data.data];
            });
          }

          const autoReplyText = data.is_queued
            ? `Hi there! 👋 Thanks for reaching out.\n\nYou are currently #${data.queue_position} in the queue. Our support team will be with you as soon as possible. Please hold on!\n\n— This is an automated message`
            : `Hi there! 👋 Thanks for reaching out. A support agent has been connected and will reply shortly.\n\n— This is an automated message`;

          if (data.is_queued && data.queue_position) {
            setQueuePosition(data.queue_position);
          }

          setIsBotTyping(true);
          setTimeout(() => {
            setIsBotTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `auto-reply-${Date.now()}`,
                sender_role: 'bot',
                message: autoReplyText,
                created_at: new Date().toISOString(),
                isAutoReply: true
              }
            ]);
            scrollToBottom();
          }, 1400);
        }

        setInputMessage('');
        editorRef.current?.clear();
        setIsEditorEmpty(true);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleTyping = () => {
    if (chatId && socketRef.current) {
      socketRef.current.emit('typing', { chatId, userName, role: 'client' });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { chatId });
      }, 1000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendWithFile = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      sender_id: userId,
      sender_role: 'client',
      message: inputMessage.trim() && !isEditorEmpty ? inputMessage.trim() : null,
      attachment_url: filePreview,
      attachment_type: selectedFile.type.startsWith('image/') ? 'image'
        : selectedFile.type.startsWith('video/') ? 'video'
        : selectedFile.type.startsWith('audio/') ? 'audio'
        : (selectedFile.type.includes('zip') || selectedFile.type.includes('rar') || selectedFile.type.includes('7z')) ? 'archive'
        : 'document',
      attachment_name: selectedFile.name,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('attachment', selectedFile);
      formData.append('sender_id', userId);
      if (chatId) {
        formData.append('chat_id', chatId);
      }
      if (inputMessage.trim() && !isEditorEmpty) {
        formData.append('message', inputMessage.trim());
      }

      const response = await fetch(`${apiUrl}/messages/upload`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(widgetToken ? { Authorization: `Bearer ${widgetToken}` } : {})
        },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success) {
        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);

          if (data.data) {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === data.data.id)) return prev;
              const optimisticIdx = prev.findIndex((m) => m.id?.toString().startsWith('optimistic-'));
              if (optimisticIdx !== -1) {
                const updated = [...prev];
                updated[optimisticIdx] = data.data;
                return updated;
              }
              return [...prev, data.data];
            });
          }

          const autoReplyText = data.is_queued
            ? `Hi there! 👋 Thanks for reaching out.\n\nYou are currently #${data.queue_position} in the queue. Our support team will be with you as soon as possible.\n\n— This is an automated message`
            : `Hi there! 👋 Thanks for reaching out. A support agent has been connected and will reply shortly.\n\n— This is an automated message`;

          if (data.is_queued && data.queue_position) {
            setQueuePosition(data.queue_position);
          }

          setIsBotTyping(true);
          setTimeout(() => {
            setIsBotTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `auto-reply-${Date.now()}`,
                sender_role: 'bot',
                message: autoReplyText,
                created_at: new Date().toISOString(),
                isAutoReply: true
              }
            ]);
          }, 1400);
        }

        clearSelectedFile();
        setInputMessage('');
        editorRef.current?.clear();
        setIsEditorEmpty(true);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      console.error('Upload error:', error);
      showToast('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('chat_widget_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('Auto-loading user from localStorage:', user);
        setUserId(user.id);
        setUserName(user.name || user.email.split('@')[0]);
        setUserEmail(user.email);
        if (user.token) setWidgetToken(user.token);
        setIsRegistered(true);

        if (user.role) {
          setUserRole(user.role);
        } else if (user.id && apiUrl) {
          // Role missing from old/external session — fetch from server
          fetch(`${apiUrl}/users/${user.id}`, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              ...(user.token ? { Authorization: `Bearer ${user.token}` } : {})
            }
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.data?.role) {
                setUserRole(d.data.role);
                const updated = { ...user, role: d.data.role };
                localStorage.setItem('chat_widget_user', JSON.stringify(updated));
              }
            })
            .catch((err) => console.error('Failed to fetch user role:', err));
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('chat_widget_user');
      }
    } else {
      console.log('No saved user found - user needs to login first');
    }
  }, []);

  useEffect(() => {
    if (userId && isRegistered) {
      loadChatHistory();
    }
  }, [userId, isRegistered]);

  /* switch to chat screen whenever an active chatId is set */
  useEffect(() => {
    if (chatId) setWidgetScreen('chat');
  }, [chatId]);

  /* switch to chat screen when a previously-ended chat is loaded */
  useEffect(() => {
    if (isChatEnded) setWidgetScreen('chat');
  }, [isChatEnded]);

  /* switch to chat screen when agent is assigned — quick chats no longer usable */
  useEffect(() => {
    if (chatMode !== CHAT_MODES.BOT) setWidgetScreen('chat');
  }, [chatMode]);

  /* fetch quick chats once the user is registered */
  useEffect(() => {
    if (!isRegistered) return;
    let cancelled = false;
    const load = async () => {
      setQuickChatsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/quick-chats`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        const quickChats = data?.data?.filter((f) => f.is_active);
        if (!cancelled && data.success) setQuickChats(quickChats || []);
      } catch {
        /* non-critical */
      } finally {
        if (!cancelled) setQuickChatsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isRegistered, apiUrl]);

  useEffect(() => {
    const checkExistingRating = async () => {
      const activeChatId = chatId || endedChatId;
      if (isChatEnded && activeChatId) {
        try {
          const response = await fetch(`${apiUrl}/ratings/chat/${activeChatId}`, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              ...(widgetToken ? { Authorization: `Bearer ${widgetToken}` } : {})
            }
          });
          const data = await response.json();
          if (data.success && data.data) {
            setRatingSubmitted(true);
            setRatingValue(data.data.rating);
            setRatingComment(data.data.comment || '');
          }
        } catch (error) {
          console.error('Error checking existing rating:', error);
        }
      }
    };

    checkExistingRating();
  }, [isChatEnded, chatId, endedChatId, apiUrl]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/chats?user_id=${userId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(widgetToken ? { Authorization: `Bearer ${widgetToken}` } : {})
        }
      });
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const activeChat = data.data.find((chat) => chat.status === 'active' || chat.status === 'queued');
        const latestChat = data.data[0];

        if (activeChat) {
          setChatId(activeChat.id);
          if (activeChat.status === 'queued') setChatMode(CHAT_MODES.PENDING_AGENT);
          else if (activeChat.status === 'active') setChatMode(CHAT_MODES.LIVE_AGENT);
          if (activeChat.messages && activeChat.messages.length > 0) {
            setMessages(activeChat.messages);
            const seenMsgs = activeChat.messages.filter((m) => m.sender_role === 'client' && m.is_seen);
            if (seenMsgs.length > 0) {
              const latestSeen = seenMsgs[seenMsgs.length - 1];
              setLastSeenAt(latestSeen.created_at);
            }
          }
        } else if (latestChat) {
          if (latestChat.messages && latestChat.messages.length > 0) {
            setMessages(latestChat.messages);
          }
          if (latestChat.status === 'ended') {
            setIsChatEnded(true);
            setEndedChatId(latestChat.id);
          }
        }
      }
    } catch (error) {
      console.error('Load history error:', error);
    }
  };

  // ── Talk to an Agent → send a message instantly then switch to chat ────────
  const handleTalkToAgent = async () => {
    if (!userId) {
      setWidgetScreen('chat');
      return;
    }

    const autoMessage = "I'd like to talk to an agent.";

    // Optimistically show the message and switch screen immediately
    const optimisticId = `optimistic-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        sender_id: userId,
        sender_role: 'client',
        message: autoMessage,
        created_at: new Date().toISOString()
      }
    ]);
    setWidgetScreen('chat');

    try {
      const payload = { sender_id: userId, message: autoMessage };
      if (chatId) payload.chat_id = chatId;

      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(widgetToken ? { Authorization: `Bearer ${widgetToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Replace optimistic message with real one
        if (data.data) {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === optimisticId);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = data.data;
              return updated;
            }
            return prev;
          });
        }

        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);

          const autoReplyText = data.is_queued
            ? `Hi there! 👋 Thanks for reaching out.\n\nYou are currently #${data.queue_position} in the queue. Our support team will be with you as soon as possible. Please hold on!\n\n— This is an automated message`
            : `Hi there! 👋 Thanks for reaching out. A support agent has been connected and will reply shortly.\n\n— This is an automated message`;

          if (data.is_queued && data.queue_position) setQueuePosition(data.queue_position);

          setIsBotTyping(true);
          setTimeout(() => {
            setIsBotTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `auto-reply-${Date.now()}`,
                sender_role: 'bot',
                message: autoReplyText,
                created_at: new Date().toISOString(),
                isAutoReply: true
              }
            ]);
            scrollToBottom();
          }, 1400);
        }
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        showToast('Failed to send message. Please try again.');
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      console.error('Talk to agent error:', error);
      showToast('Failed to connect. Please try again.');
    }
  };

  // ── Quick chat click → inject bot reply locally, switch to chat screen ──
  const handleQuickChatSelect = (qc) => {
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: `qc-user-${now}`,
        sender_id: userId,
        sender_role: 'client',
        message: qc.title,
        created_at: new Date().toISOString()
      }
    ]);
    setWidgetScreen('chat');
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `qc-bot-${now + 1}`,
          sender_role: 'bot',
          message: qc.response,
          created_at: new Date().toISOString(),
          isAutoReply: true
        }
      ]);
      scrollToBottom();
    }, 1400);
  };

  // ── Escalation handler ──────────────────────────────────────────────────
  const handleEscalateToAgent = useCallback(async () => {
    if (chatMode !== CHAT_MODES.BOT || isEscalating) return;

    if (!chatId) {
      showToast('Please send a message first to start a chat, then we can connect you with an agent.');
      return;
    }

    setIsEscalating(true);
    setChatMode(CHAT_MODES.PENDING_AGENT);

    // Track resolved state in local mutable ref so the interval sees fresh values
    let resolved = false;

    const attempt = async () => {
      if (resolved) return;
      try {
        const result = await escalateToAgent(apiUrl, userId, chatId);

        if (result.status === 'assigned') {
          resolved = true;
          setChatMode(CHAT_MODES.LIVE_AGENT);
          setEscalatedAgentName(result.agentName || 'an Agent');
          setIsEscalating(false);
          clearInterval(escalationPollRef.current);
          escalationPollRef.current = null;
        }
        // 'no_agent_available' → stay in PENDING_AGENT, polling continues
      } catch (err) {
        resolved = true;
        console.error('Escalation error:', err);
        setChatMode(CHAT_MODES.BOT);
        setIsEscalating(false);
        clearInterval(escalationPollRef.current);
        escalationPollRef.current = null;
        showToast(err.message || 'Could not connect to an agent. Please try again.');
      }
    };

    // First immediate attempt
    await attempt();

    // If not yet resolved, start polling every 10 s
    if (!resolved) {
      escalationPollRef.current = setInterval(async () => {
        if (resolved) {
          clearInterval(escalationPollRef.current);
          escalationPollRef.current = null;
          return;
        }
        await attempt();
      }, 10000);
    }
  }, [chatMode, isEscalating, apiUrl, userId, chatId]);

  // Cleanup escalation poll on unmount or chat end
  useEffect(() => {
    if (isChatEnded) {
      clearInterval(escalationPollRef.current);
      escalationPollRef.current = null;
    }
    return () => {
      clearInterval(escalationPollRef.current);
    };
  }, [isChatEnded]);

  // Browser leave-warning: prompt when a chat is active
  useEffect(() => {
    if (!chatId || isChatEnded) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';

      // Best-effort: end the chat when the user actually leaves
      if (chatIdRef.current) {
        fetch(`${apiUrl}/chats/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(widgetTokenRef.current ? { Authorization: `Bearer ${widgetTokenRef.current}` } : {})
          },
          body: JSON.stringify({ chat_id: chatIdRef.current }),
          keepalive: true
        }).catch(() => { });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [chatId, isChatEnded, apiUrl]);

  // Auto-end chat when the user session is cleared (logout / session removed)
  useEffect(() => {
    const endChatSilently = () => {
      if (!chatIdRef.current || clientEndedChatRef.current) return;
      clientEndedChatRef.current = true;
      fetch(`${apiUrl}/chats/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(widgetTokenRef.current ? { Authorization: `Bearer ${widgetTokenRef.current}` } : {})
        },
        body: JSON.stringify({ chat_id: chatIdRef.current }),
        keepalive: true
      }).catch(() => { });
    };

    // Same-tab logout: fake-dashboard dispatches this before clearing localStorage
    window.addEventListener('user-logout', endChatSilently);

    // Cross-tab logout: storage event fires when another tab removes the key
    const handleStorage = (e) => {
      if (e.key === 'chat_widget_user' && !e.newValue) {
        endChatSilently();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('user-logout', endChatSilently);
      window.removeEventListener('storage', handleStorage);
    };
  }, [apiUrl]);

  const handleEndChat = async () => {
    if (!chatId) return;
    setIsEndingChat(true);
    clientEndedChatRef.current = true;
    try {
      const response = await fetch(`${apiUrl}/chats/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(widgetToken ? { Authorization: `Bearer ${widgetToken}` } : {})
        },
        body: JSON.stringify({ chat_id: chatId })
      });
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-end-${Date.now()}`,
            sender_role: 'bot',
            message: 'You ended this chat.',
            created_at: new Date().toISOString(),
            isSystemMsg: true
          }
        ]);
        setIsChatEnded(true);
        setEndedChatId(chatId);
        setShowEndChatConfirm(false);
      } else {
        clientEndedChatRef.current = false;
        showToast(data.message || 'Failed to end chat.');
        setShowEndChatConfirm(false);
      }
    } catch (error) {
      clientEndedChatRef.current = false;
      console.error('End chat error:', error);
      showToast('Failed to end chat. Please try again.');
      setShowEndChatConfirm(false);
    } finally {
      setIsEndingChat(false);
    }
  };

  const handleStartNewChat = () => {
    setChatId(null);
    setMessages([]);
    setIsChatEnded(false);
    setEndedChatId(null);
    setQueuePosition(null);
    setLastSeenAt(null);
    setRatingValue(0);
    setRatingHover(0);
    setRatingComment('');
    setRatingSubmitted(false);
    // Reset escalation
    setChatMode(CHAT_MODES.BOT);
    setEscalatedAgentName('');
    setIsEscalating(false);
    clearInterval(escalationPollRef.current);
    escalationPollRef.current = null;
    clientEndedChatRef.current = false;
    // Return to quick chats screen
    setWidgetScreen('quick_chats');
    setQuickChatSearch('');
  };

  const handleSubmitRating = async () => {
    const activeChatId = chatId || endedChatId;
    if (!ratingValue || !activeChatId || !userId) return;
    setIsRatingSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          chat_id: activeChatId,
          client_id: userId,
          rating: ratingValue,
          comment: ratingComment.trim() || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setRatingSubmitted(true);
      } else {
        showToast(data.message || 'Failed to submit rating.');
      }
    } catch (error) {
      console.error('Rating error:', error);
      showToast('Failed to submit rating. Please try again.');
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSeenTime = (timestamp) => {
    const seenDate = new Date(timestamp);
    const diffMs = Date.now() - seenDate.getTime();
    if (diffMs < 60000) return 'just now';
    return seenDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredQCs = quickChatSearch.trim()
    ? quickChats.filter((qc) => qc.title.toLowerCase().includes(quickChatSearch.toLowerCase()))
    : quickChats;

  return (
    <div className="chat-widget-container">
      {toast.show && (
        <div className="chat-widget-toast">
          <span>{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '' })} className="chat-toast-close">
            ×
          </button>
        </div>
      )}

      <button className="chat-widget-button" onClick={() => setIsOpen(!isOpen)} aria-label="Open chat">
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {/* {!isOpen && messages.length > 0 && <span className="chat-notification-badge">{messages.length}</span>} */}
      </button>

      {isOpen && (
        <div className="chat-widget-window">
          {/* End Chat confirmation dialog */}
          {showEndChatConfirm && (
            <div className="cw-end-confirm-overlay">
              <div className="cw-end-confirm-box">
                <p className="cw-end-confirm-title">End Chat?</p>
                <p className="cw-end-confirm-msg">Are you sure you want to end this chat?</p>
                <div className="cw-end-confirm-actions">
                  <button
                    type="button"
                    className="cw-end-confirm-cancel"
                    onClick={() => setShowEndChatConfirm(false)}
                    disabled={isEndingChat}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cw-end-confirm-end"
                    onClick={handleEndChat}
                    disabled={isEndingChat}
                  >
                    {isEndingChat ? 'Ending…' : 'End Chat'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-header-left">
              <div className="chat-header-avatar">💬</div>
              <div className="chat-header-info">
                <h3>Customer Support</h3>
                <div className="chat-status-row">
                  <span className={`chat-status-dot ${isConnected ? 'online' : 'offline'}`} />
                  <span className="chat-status-text">{isConnected ? 'Online — we’re here to help' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div className="cw-header-actions">
              {chatId && !isChatEnded && (
                <button
                  type="button"
                  className="cw-end-chat-btn"
                  onClick={() => setShowEndChatConfirm(true)}
                  aria-label="End chat"
                >
                  End Chat
                </button>
              )}
              <button className="chat-close-button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                ×
              </button>
            </div>
          </div>

          {!isRegistered && (
            <div className="chat-widget-register">
              <div className="chat-register-welcome">
                <div className="chat-register-icon">👋</div>
                <h4>Hi there, welcome!</h4>
                <p>Fill in your details and a support agent will be with you shortly.</p>
              </div>
              <form className="chat-register-form" onSubmit={handleRegister}>
                <div className="chat-field-group">
                  <label className="chat-field-label">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                    className="chat-input-field"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="chat-submit-button">
                  {isLoading ? 'Connecting…' : 'Start Chat →'}
                </button>
              </form>
            </div>
          )}

          {/* ── Access Restricted Screen ── */}
          {isRegistered && userRole && userRole !== 'client' && (
            <div className="cw-restricted">
              <div className="cw-restricted-icon">🔒</div>
              <h4 className="cw-restricted-title">Access Restricted</h4>
              <p className="cw-restricted-body">
                This support widget is for clients only.
                <br />
                Your account type (<strong>{userRole}</strong>) doesn&rsquo;t have access here.
              </p>
              <button
                type="button"
                className="cw-restricted-btn"
                onClick={() => {
                  localStorage.removeItem('chat_widget_user');
                  setIsRegistered(false);
                  setUserRole('');
                  setUserId(null);
                  setUserEmail('');
                  setUserName('');
                  setWidgetToken(null);
                }}
              >
                Sign in with a different account
              </button>
              <div className="chat-widget-footer" style={{ marginTop: 'auto' }}>
                Powered by{' '}
                <a href="#" tabIndex="-1">
                  Timora Live Chat
                </a>
              </div>
            </div>
          )}

          {/* ── Quick Chats Screen ── */}
          {isRegistered && userRole === 'client' && widgetScreen === 'quick_chats' && !isChatEnded && chatMode === CHAT_MODES.BOT && (
            <div className="cw-qc-screen">
              <div className="cw-qc-header">
                {messages.length > 0 && (
                  <button type="button" className="cw-qc-back-btn" onClick={() => setWidgetScreen('chat')}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to chat
                  </button>
                )}
                <div className="cw-qc-header-icon">💬</div>
                <h4 className="cw-qc-title">Quick Answers</h4>
                <p className="cw-qc-subtitle">Pick a topic below to get an instant answer, or talk to a real person.</p>
              </div>

              <div className="cw-qc-search-wrap">
                <span className="cw-qc-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="cw-qc-search"
                  placeholder="Search answers…"
                  value={quickChatSearch}
                  onChange={(e) => setQuickChatSearch(e.target.value)}
                />
                {quickChatSearch && (
                  <button className="cw-qc-search-clear" type="button" onClick={() => setQuickChatSearch('')}>
                    ×
                  </button>
                )}
              </div>

              <div className="cw-qc-list">
                {quickChatsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="cw-qc-item">
                      <div className="cw-qc-skeleton-header" />
                    </div>
                  ))
                ) : filteredQCs.length === 0 ? (
                  <div className="cw-qc-empty">
                    {quickChatSearch.trim() ? `No results for "${quickChatSearch}".` : 'No quick answers available yet.'}
                  </div>
                ) : (
                  filteredQCs.map((qc) => (
                    <div key={qc.id} className="cw-qc-item">
                      <button type="button" className="cw-qc-item-header" onClick={() => handleQuickChatSelect(qc)}>
                        <span className="cw-qc-item-title">{qc.title}</span>
                        <svg
                          className="cw-qc-chevron"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {chatMode === CHAT_MODES.BOT && (
              <div className="cw-qc-cta">
                <p className="cw-qc-cta-label">Still have an issue?</p>
                <button type="button" className="cw-qc-agent-btn" onClick={handleTalkToAgent}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Talk to an Agent
                </button>
              </div>
              )}

              <div className="chat-widget-footer">
                Powered by{' '}
                <a href="#" tabIndex="-1">
                  Timora Live Chat
                </a>
              </div>
            </div>
          )}

          {/* ── Chat Screen ── */}
          {isRegistered && userRole === 'client' && (widgetScreen === 'chat' || isChatEnded) && (
            <>
              {/* Back navigation bar */}
              {!isChatEnded && chatMode === CHAT_MODES.BOT && !chatId && (
                <div className="cw-chat-back-nav">
                  <button type="button" className="cw-chat-back-btn" onClick={() => setWidgetScreen('quick_chats')}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Quick Answers
                  </button>
                </div>
              )}
              <div className="chat-widget-messages">
                {messages.length === 0 && !chatId && !isChatEnded && (
                  <div className="chat-empty-state">
                    <div className="chat-empty-icon">💬</div>
                    <h5>How can we help you?</h5>
                    <p>Send us a message and a support agent will reply right away.</p>
                  </div>
                )}

                {(() => {
                  const uid = Number(userId);
                  const lastSeenSentIdx = lastSeenAt
                    ? messages.reduce((acc, msg, i) => {
                      if (
                        Number(msg.sender_id) === uid &&
                        msg.sender_role !== 'bot' &&
                        msg.created_at &&
                        new Date(msg.created_at) <= new Date(lastSeenAt)
                      )
                        return i;
                      return acc;
                    }, -1)
                    : -1;

                  return messages.map((msg, index) => {
                    const isSent = Number(msg.sender_id) === uid;
                    const isBot = msg.sender_role === 'bot';
                    const hasAttachment = msg.attachment_url;
                    const showSeen = Boolean(lastSeenAt) && index === lastSeenSentIdx && isSent;

                    if (msg.isSystemMsg) {
                      return (
                        <React.Fragment key={index}>
                          <div className="cw-system-msg">
                            <span>{msg.message}</span>
                          </div>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={index}>
                        <div className={`chat-message ${isSent ? 'sent' : isBot ? 'bot' : 'received'}`}>
                          {isBot && (
                            <div className="chat-bot-label">
                              <span className="chat-bot-icon">⚡</span> Automated Reply
                            </div>
                          )}
                          <div className="chat-message-content">
                            {hasAttachment && (
                              <div className="chat-attachment">
                                {msg.attachment_type === 'image' ? (
                                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={msg.attachment_url}
                                      alt={msg.attachment_name || 'Attachment'}
                                      className="chat-attachment-image"
                                    />
                                  </a>
                                ) : (
                                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="chat-attachment-file">
                                    <span className="chat-file-icon">
                                      {msg.attachment_type === 'video'
                                        ? '🎬'
                                        : msg.attachment_type === 'audio'
                                          ? '🎵'
                                          : msg.attachment_type === 'archive'
                                            ? '📦'
                                            : '📄'}
                                    </span>
                                    <span className="chat-file-name">{msg.attachment_name || 'Download file'}</span>
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.message &&
                              (msg.message.startsWith('<') ? (
                                <div className="cw-rich-msg" dangerouslySetInnerHTML={{ __html: msg.message }} />
                              ) : (
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                              ))}
                          </div>
                        </div>
                        {showSeen && (
                          <div className="chat-message-seen">
                            <svg width="14" height="10" viewBox="0 0 16 11" fill="none" aria-hidden="true">
                              <path
                                d="M1 5.5L5.5 10L15 1"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6 5.5L10.5 10L20 1"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Seen {formatSeenTime(lastSeenAt)}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}

                {(isTyping || isBotTyping) && (
                  <div className="chat-typing-indicator">
                    <span>{isBotTyping ? '' : agentName || 'Agent'}</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                {/* ── Pending agent state ── */}
                {!isChatEnded && chatMode === CHAT_MODES.PENDING_AGENT && (
                  <div className="chat-escalation-pending">
                    <div className="chat-escalation-spinner" />
                    <p className="chat-escalation-pending-text">All agents are currently busy. Please wait&hellip;</p>
                    <p className="chat-escalation-pending-sub">
                      We&rsquo;re looking for an available agent and will connect you automatically.
                    </p>
                  </div>
                )}

                {/* ── Agent connected state ── */}
                {!isChatEnded && chatMode === CHAT_MODES.LIVE_AGENT && escalatedAgentName && (
                  <div className="chat-escalation-connected">
                    <div className="chat-escalation-connected-icon">✓</div>
                    <p className="chat-escalation-connected-text">
                      You are now connected to Agent&nbsp;
                      <strong>{escalatedAgentName}</strong>
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Ended Banner */}
              {isChatEnded && (
                <div className="chat-ended-banner">
                  <div className="chat-ended-icon">✓</div>
                  <p className="chat-ended-title">Chat session ended</p>
                  <p className="chat-ended-sub">This conversation has been closed by the support team.</p>

                  {/* Star Rating */}
                  {!ratingSubmitted ? (
                    <div className="chat-rating-section">
                      <p className="chat-rating-prompt">How would you rate your experience?</p>
                      <div className="chat-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`chat-star-btn ${star <= (ratingHover || ratingValue) ? 'active' : ''}`}
                            onClick={() => setRatingValue(star)}
                            onMouseEnter={() => setRatingHover(star)}
                            onMouseLeave={() => setRatingHover(0)}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {ratingValue > 0 && (
                        <div className="chat-rating-labels">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][ratingValue]}</div>
                      )}
                      {ratingValue > 0 && (
                        <textarea
                          className="chat-rating-comment"
                          placeholder="Leave a comment (optional)…"
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          rows={2}
                          maxLength={300}
                        />
                      )}
                      {ratingValue > 0 && (
                        <button type="button" className="chat-rating-submit-btn" onClick={handleSubmitRating} disabled={isRatingSubmitting}>
                          {isRatingSubmitting ? 'Submitting…' : 'Submit Rating'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="chat-rating-thankyou">
                      <div className="chat-rating-thankyou-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={s <= ratingValue ? 'filled' : ''}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="chat-rating-thankyou-text">Thanks for your feedback! 🙏</p>
                    </div>
                  )}

                  <button className="chat-new-session-btn" onClick={handleStartNewChat}>
                    Start New Chat
                  </button>
                </div>
              )}

              {/* Input */}
              {!isChatEnded && (
                <>
                  {/* File Preview */}
                  {selectedFile && (
                    <div className="chat-file-preview">
                      <div className="chat-file-preview-content">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="chat-file-preview-image" />
                        ) : (
                          <div className="chat-file-preview-icon">
                            {selectedFile.type.startsWith('video/') ? '🎬' : selectedFile.type.startsWith('audio/') ? '🎵' : '📄'}
                          </div>
                        )}
                        <div className="chat-file-preview-info">
                          <span className="chat-file-preview-name">{selectedFile.name}</span>
                          <span className="chat-file-preview-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button type="button" className="chat-file-preview-remove" onClick={clearSelectedFile} aria-label="Remove file">
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (selectedFile) {
                        handleSendWithFile();
                      } else {
                        handleSendMessage(e);
                      }
                    }}
                    className="chat-widget-input"
                  >
                    <div className="chat-input-row">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*" />
                      <button
                        type="button"
                        className="chat-attach-button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Attach file"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>
                      <WidgetEditor
                        ref={editorRef}
                        onChange={(html, empty) => {
                          setInputMessage(html);
                          setIsEditorEmpty(empty);
                        }}
                        onTyping={handleTyping}
                        placeholder={selectedFile ? 'Add a message (optional)…' : 'Type a message…'}
                        disabled={false}
                      />
                      <button
                        type="submit"
                        disabled={(isEditorEmpty && !selectedFile) || isUploading}
                        className="chat-send-button"
                        aria-label="Send message"
                      >
                        {isUploading ? (
                          <div className="chat-upload-spinner" />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
              <div className="chat-widget-footer">
                Powered by{' '}
                <a href="#" tabIndex="-1">
                  Timora Live Chat
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
