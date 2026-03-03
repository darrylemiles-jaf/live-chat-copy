import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatWidget.css';

const ChatWidget = ({ apiUrl = '', socketUrl = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
  const [concern, setConcern] = useState('');
  const [lastConcern, setLastConcern] = useState('');
  const [lastIsCustomConcern, setLastIsCustomConcern] = useState(false);
  const [concernOptions, setConcernOptions] = useState([]);
  const [concernDropdownOpen, setConcernDropdownOpen] = useState(false);
  const [isCustomConcern, setIsCustomConcern] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(null);

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleConcernInput = (e) => {
    const value = e.target.value;
    if (isCustomConcern) {
      const hasTrailingSpace = value.endsWith(' ');
      const transformed = toTitleCase(value);
      setConcern(hasTrailingSpace && value.trim() ? transformed + ' ' : transformed);
    } else {
      setConcern(toTitleCase(value));
      setConcernDropdownOpen(true);
    }
  };

  const STATIC_CONCERNS = [
    { id: 's1', name: 'General Inquiry' },
    { id: 's2', name: 'Technical Issue' },
  ];

  const allConcernOptions = [
    ...STATIC_CONCERNS,
    ...concernOptions.filter(
      opt => !STATIC_CONCERNS.some(s => s.name.toLowerCase() === opt.name.toLowerCase())
    ),
    { id: 'other', name: 'Other' }
  ];

  const filteredConcernOptions = allConcernOptions.filter(opt =>
    !isCustomConcern || concern === '' || opt.name.toLowerCase().includes(concern.toLowerCase())
  );

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const QUICK_REPLIES = [
    'Hi, I need help!',
    'I have an inquiry',
    'I want to follow up on something',
    'Billing question',
    'Technical issue',
    'Track my order',
  ];

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatIdRef = useRef(chatId);
  const fileInputRef = useRef(null);
  const concernRef = useRef(null);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    fetch(`${apiUrl}/concern-types`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json())
      .then(data => { if (data?.success) setConcernOptions(data.data); })
      .catch(() => { });
  }, [apiUrl]);

  useEffect(() => {
    const handler = (e) => {
      if (concernRef.current && !concernRef.current.contains(e.target)) {
        setConcernDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
        setMessages(prev => {
          if (prev.some(msg => msg.id === message.id)) {
            console.log('⚠️ Widget: Duplicate message, skipping');
            return prev;
          }
          console.log('✅ Widget: Adding message to UI');
          return [...prev, message];
        });
        scrollToBottom();

        if (message.sender_role !== 'client' && message.sender_role !== 'bot' && chatIdRef.current) {
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
          setIsChatEnded(true);
          setEndedChatId(updatedChatId);
        } else if (status === 'active') {
          setQueuePosition(null);
        }
      }
    });

    socketRef.current.on('queue_position_update', ({ position }) => {
      console.log('🔢 Widget received queue position update:', position);
      setQueuePosition(prev => {
        if (prev !== null && prev !== position) {
          const posLabel = position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : `${position}th`;
          setMessages(msgs => [
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
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        setUserId(userIdToStore);
        console.log('New user created:', userIdToStore);
      } else if (data.success) {
        userIdToStore = data.data?.id;
        setUserId(userIdToStore);
        console.log('User logged in:', userIdToStore);
      }

      if (!userIdToStore) {
        console.error('Failed to get user ID from response:', data);
        showToast('Failed to register. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsRegistered(true);

      localStorage.setItem('chat_widget_user', JSON.stringify({
        id: userIdToStore,
        name: userName,
        email: userEmail
      }));

      console.log('User registered and saved to localStorage:', { id: userIdToStore, name: userName, email: userEmail });

    } catch (error) {
      console.error('Registration error:', error);
      showToast('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !userId) {
      console.warn('Cannot send message:', { inputMessage, userId });
      return;
    }

    const messagePayload = {
      sender_id: userId,
      message: inputMessage.trim()
    };

    if (chatId) {
      messagePayload.chat_id = chatId;
    } else if (concern) {
      messagePayload.concern = isCustomConcern ? toTitleCase(concern.trim()) : concern;
    }

    console.log('Sending message:', messagePayload);

    try {
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(messagePayload)
      });

      const data = await response.json();
      console.log('Message response:', data);

      if (data.success) {
        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);

          if (concern) {
            const formattedConcern = isCustomConcern ? toTitleCase(concern.trim()) : concern;
            try {
              const map = JSON.parse(localStorage.getItem('chat_concern_map') || '{}');
              map[newChatId] = formattedConcern;
              localStorage.setItem('chat_concern_map', JSON.stringify(map));
            } catch (_) { }
            // Update state with formatted concern
            if (isCustomConcern) {
              setConcern(formattedConcern);
            }
          }

          if (data.data) {
            setMessages(prev => {
              if (prev.some(msg => msg.id === data.data.id)) return prev;
              return [...prev, data.data];
            });
          }

          const autoReplyText = data.is_queued
            ? `Hi there! 👋 Thanks for reaching out.\n\nYou are currently #${data.queue_position} in the queue. Our support team will be with you as soon as possible. Please hold on!\n\n— This is an automated message`
            : `Hi there! 👋 Thanks for reaching out. A support agent has been connected and will reply shortly.\n\n— This is an automated message`;

          if (data.is_queued && data.queue_position) {
            setQueuePosition(data.queue_position);
          }

          setTimeout(() => {
            setMessages(prev => [
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
          }, 600);
        }

        setInputMessage('');
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

    try {
      const formData = new FormData();
      formData.append('attachment', selectedFile);
      formData.append('sender_id', userId);
      if (chatId) {
        formData.append('chat_id', chatId);
      } else if (concern) {
        formData.append('concern', isCustomConcern ? toTitleCase(concern.trim()) : concern);
      }
      if (inputMessage.trim()) {
        formData.append('message', inputMessage.trim());
      }

      const response = await fetch(`${apiUrl}/messages/upload`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success) {
        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);

          if (concern) {
            const formattedConcern = isCustomConcern ? toTitleCase(concern.trim()) : concern;
            try {
              const map = JSON.parse(localStorage.getItem('chat_concern_map') || '{}');
              map[newChatId] = formattedConcern;
              localStorage.setItem('chat_concern_map', JSON.stringify(map));
            } catch (_) { }
            if (isCustomConcern) {
              setConcern(formattedConcern);
            }
          }

          if (data.data) {
            setMessages(prev => {
              if (prev.some(msg => msg.id === data.data.id)) return prev;
              return [...prev, data.data];
            });
          }

          const autoReplyText = data.is_queued
            ? `Hi there! 👋 Thanks for reaching out.\n\nYou are currently #${data.queue_position} in the queue. Our support team will be with you as soon as possible.\n\n— This is an automated message`
            : `Hi there! 👋 Thanks for reaching out. A support agent has been connected and will reply shortly.\n\n— This is an automated message`;

          if (data.is_queued && data.queue_position) {
            setQueuePosition(data.queue_position);
          }

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: `auto-reply-${Date.now()}`,
                sender_role: 'bot',
                message: autoReplyText,
                created_at: new Date().toISOString(),
                isAutoReply: true
              }
            ]);
          }, 600);
        }

        clearSelectedFile();
        setInputMessage('');
      }
    } catch (error) {
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
        setIsRegistered(true);
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

  useEffect(() => {
    const checkExistingRating = async () => {
      const activeChatId = chatId || endedChatId;
      if (isChatEnded && activeChatId) {
        try {
          const response = await fetch(`${apiUrl}/ratings/chat/${activeChatId}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
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
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const activeChat = data.data.find(chat =>
          chat.status === 'active' || chat.status === 'queued'
        );
        const latestChat = data.data[0];

        if (activeChat) {
          setChatId(activeChat.id);
          if (!activeChat.concern) {
            try {
              const map = JSON.parse(localStorage.getItem('chat_concern_map') || '{}');
              if (map[activeChat.id]) setConcern(map[activeChat.id]);
            } catch (_) { }
          } else {
            setConcern(activeChat.concern);
          }
          if (activeChat.messages && activeChat.messages.length > 0) {
            setMessages(activeChat.messages);
            const seenMsgs = activeChat.messages.filter(m => m.sender_role === 'client' && m.is_seen);
            if (seenMsgs.length > 0) {
              const latestSeen = seenMsgs[seenMsgs.length - 1];
              setLastSeenAt(latestSeen.created_at);
            }

            if (socketRef.current?.connected) {
              socketRef.current.emit('mark_messages_read', {
                chatId: activeChat.id,
                readerRole: 'client'
              });
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

  const handleStartNewChat = () => {
    const prevConcern = concern;
    const prevIsCustom = isCustomConcern;
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
    setConcern(prevConcern);
    setIsCustomConcern(false);
    setLastConcern(prevConcern);
    setLastIsCustomConcern(prevIsCustom);
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

  return (
    <div className="chat-widget-container">
      {toast.show && (
        <div className="chat-widget-toast">
          <span>{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '' })} className="chat-toast-close">×</button>
        </div>
      )}

      <button
        className="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {!isOpen && messages.length > 0 && (
          <span className="chat-notification-badge">{messages.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-header-left">
              <div className="chat-header-avatar">💬</div>
              <div className="chat-header-info">
                <h3>Customer Support</h3>
                <div className="chat-status-row">
                  <span className={`chat-status-dot ${isConnected ? 'online' : 'offline'}`} />
                  <span className="chat-status-text">
                    {isConnected ? 'Online — we’re here to help' : 'Offline'}
                  </span>
                  {concern && (
                    <span
                      className="chat-concern-badge"
                      style={!chatId ? { cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' } : {}}
                      title={!chatId ? 'Click to change concern' : ''}
                    >
                      {concern}
                      {!chatId && (
                        <button
                          type="button"
                          className="chat-concern-badge-clear"
                          aria-label="Change concern"
                          onClick={() => {
                            setConcern('');
                            setIsCustomConcern(false);
                            setConcernDropdownOpen(true);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              className="chat-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
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
                <button
                  type="submit"
                  disabled={isLoading}
                  className="chat-submit-button"
                >
                  {isLoading ? 'Connecting…' : 'Start Chat →'}
                </button>
              </form>
            </div>
          )}

          {/* Messages */}
          {isRegistered && (
            <>
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
                        ) return i;
                        return acc;
                      }, -1)
                    : -1;

                  return messages.map((msg, index) => {
                    const isSent = Number(msg.sender_id) === uid;
                    const isBot = msg.sender_role === 'bot';
                    const hasAttachment = msg.attachment_url;
                    const showSeen = Boolean(lastSeenAt) && index === lastSeenSentIdx && isSent;
                    return (
                      <React.Fragment key={index}>
                        <div
                          className={`chat-message ${isSent ? 'sent' : isBot ? 'bot' : 'received'}`}
                        >
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
                                  <a
                                    href={msg.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="chat-attachment-file"
                                  >
                                    <span className="chat-file-icon">
                                      {msg.attachment_type === 'video' ? '🎬' :
                                        msg.attachment_type === 'audio' ? '🎵' :
                                          msg.attachment_type === 'archive' ? '📦' : '📄'}
                                    </span>
                                    <span className="chat-file-name">{msg.attachment_name || 'Download file'}</span>
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.message && <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>}
                          </div>
                        </div>
                        {showSeen && (
                          <div className="chat-message-seen">
                            <svg width="14" height="10" viewBox="0 0 16 11" fill="none" aria-hidden="true">
                              <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Seen {formatSeenTime(lastSeenAt)}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}

                {isTyping && (
                  <div className="chat-typing-indicator">
                    <span>typing</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
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
                            className={`chat-star-btn ${star <= (ratingHover || ratingValue) ? 'active' : ''
                              }`}
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
                        <div className="chat-rating-labels">
                          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][ratingValue]}
                        </div>
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
                        <button
                          type="button"
                          className="chat-rating-submit-btn"
                          onClick={handleSubmitRating}
                          disabled={isRatingSubmitting}
                        >
                          {isRatingSubmitting ? 'Submitting…' : 'Submit Rating'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="chat-rating-thankyou">
                      <div className="chat-rating-thankyou-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={s <= ratingValue ? 'filled' : ''}>★</span>
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

              {/* Quick Replies */}
              {!isChatEnded && messages.length === 0 && concern.trim() && (
                <div className="chat-quick-replies">
                  <span className="chat-quick-replies-label">Quick replies</span>
                  <div className="chat-quick-replies-list">
                    {QUICK_REPLIES.map((text) => (
                      <button
                        key={text}
                        className="chat-quick-reply-btn"
                        onClick={() => setInputMessage(text)}
                        type="button"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
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
                            {selectedFile.type.startsWith('video/') ? '🎬' :
                              selectedFile.type.startsWith('audio/') ? '🎵' : '📄'}
                          </div>
                        )}
                        <div className="chat-file-preview-info">
                          <span className="chat-file-preview-name">{selectedFile.name}</span>
                          <span className="chat-file-preview-size">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          className="chat-file-preview-remove"
                          onClick={clearSelectedFile}
                          aria-label="Remove file"
                        >
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
                    {!chatId && !isChatEnded && (
                      <div
                        className="chat-concern-inline"
                        ref={concernRef}
                        onClick={() => !isCustomConcern && setConcernDropdownOpen(true)}
                        style={!isCustomConcern ? { cursor: 'pointer' } : {}}
                      >
                        <input
                          type="text"
                          placeholder={isCustomConcern ? "Type your concern…" : "Select a concern first…"}
                          value={concern === 'Other' && !isCustomConcern ? '' : concern}
                          onChange={handleConcernInput}
                          onFocus={() => !isCustomConcern && setConcernDropdownOpen(true)}
                          autoComplete="off"
                          className="chat-concern-inline-input"
                          readOnly={!isCustomConcern}
                          style={!isCustomConcern ? { cursor: 'pointer' } : {}}
                        />
                        {!isCustomConcern && <span className="chat-concern-bar-chevron">▾</span>}
                        {concernDropdownOpen && filteredConcernOptions.length > 0 && !isCustomConcern && (
                          <ul className="chat-concern-dropdown">
                            {filteredConcernOptions.map(opt => (
                              <li
                                key={opt.id}
                                className={`chat-concern-option${concern === opt.name ? ' selected' : ''}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  if (opt.name === 'Other') {
                                    setIsCustomConcern(true);
                                    setConcern('');
                                    setConcernDropdownOpen(false);
                                  } else {
                                    setConcern(opt.name);
                                    setIsCustomConcern(false);
                                    setConcernDropdownOpen(false);
                                  }
                                }}
                              >
                                {opt.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className="chat-input-row" style={!chatId && !isChatEnded && !concern.trim() ? { display: 'none' } : {}}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept="image/*"
                      />
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
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => {
                          setInputMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder={selectedFile ? 'Add a message (optional)...' : 'Type a message…'}
                        className="chat-message-input"
                      />
                      <button
                        type="submit"
                        disabled={(!inputMessage.trim() && !selectedFile) || isUploading}
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
                Powered by <a href="#" tabIndex="-1">Timora Live Chat</a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
