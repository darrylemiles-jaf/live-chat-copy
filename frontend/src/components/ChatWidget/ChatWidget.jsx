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

  // Keep chatIdRef in sync
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Initialize socket connection (only when registered)
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
      // Join chat room if we have an active chat
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

      // Only add messages for our current chat (or any message if no chatId yet)
      if (msgChatId === currentChatId || !currentChatId) {
        setMessages(prev => {
          // Prevent duplicates by checking if message with this ID already exists
          if (prev.some(msg => msg.id === message.id)) {
            console.log('⚠️ Widget: Duplicate message, skipping');
            return prev;
          }
          console.log('✅ Widget: Adding message to UI');
          return [...prev, message];
        });
        scrollToBottom();
      } else {
        console.log('⏭️ Widget: Message for different chat, skipping');
      }
    });

    socketRef.current.on('user_typing', ({ userName, role }) => {
      // Only show typing indicator when the agent/support is typing (not the customer themselves)
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

    socketRef.current.on('chat_status_update', ({ chatId: updatedChatId, status }) => {
      console.log('🔄 Widget received chat status update:', { chatId: updatedChatId, status });
      if (updatedChatId === chatIdRef.current) {
        if (status === 'ended') {
          setIsChatEnded(true);
        } else if (status === 'active') {
          // Chat was assigned to an agent — clear queue position
          setQueuePosition(null);
        }
      }
    });

    socketRef.current.on('queue_position_update', ({ position }) => {
      console.log('🔢 Widget received queue position update:', position);
      setQueuePosition(prev => {
        // Only show update message when position actually changed (not on initial set)
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
  }, [isRegistered, userId, socketUrl]); // Note: chatId removed from deps - we use ref instead

  // Join chat room when chatId changes (after first message creates chat)
  useEffect(() => {
    if (socketRef.current?.connected && chatId) {
      socketRef.current.emit('join_chat', chatId);
      console.log(`💬 Widget joined new chat room: chat_${chatId}`);
    }
  }, [chatId]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create/login user
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          email: userEmail,
          password: 'SecurePass123' // Default password for clients
        })
      });

      const data = await response.json();
      let userIdToStore;

      if (!data.success && response.status === 404) {
        // User doesn't exist, create new client
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

      // Store in localStorage with the actual user ID
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

  // Send message
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
        // Set chatId if this is the first message
        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);
          console.log('Joined chat room:', newChatId);

          // Add the first message manually since we just joined the room
          if (data.data) {
            setMessages(prev => {
              if (prev.some(msg => msg.id === data.data.id)) return prev;
              return [...prev, data.data];
            });
          }

          // Inject a frontend-only auto-reply (not stored in DB)
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

        // Clear input
        setInputMessage('');
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (chatId && socketRef.current) {
      socketRef.current.emit('typing', { chatId, userName, role: 'client' });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { chatId });
      }, 1000);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB');
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

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message with file
  const handleSendWithFile = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('attachment', selectedFile);
      formData.append('sender_id', userId);
      if (chatId) {
        formData.append('chat_id', chatId);
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
        // Set chatId if this is the first message
        if (!chatId && data.chat_id) {
          const newChatId = data.chat_id;
          setChatId(newChatId);
          socketRef.current?.emit('join_chat', newChatId);

          // Add the message manually
          if (data.data) {
            setMessages(prev => {
              if (prev.some(msg => msg.id === data.data.id)) return prev;
              return [...prev, data.data];
            });
          }

          // Auto reply for new chat
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

  // Auto-load user info from localStorage (from main app login)
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

  // Load chat history when userId is set
  useEffect(() => {
    if (userId && isRegistered) {
      loadChatHistory();
    }
  }, [userId, isRegistered]);

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
          if (activeChat.messages && activeChat.messages.length > 0) {
            setMessages(activeChat.messages);
          }
        } else if (latestChat) {
          // Show previous conversation but mark as ended — no chatId so next message starts fresh
          if (latestChat.messages && latestChat.messages.length > 0) {
            setMessages(latestChat.messages);
          }
          if (latestChat.status === 'ended') {
            setIsChatEnded(true);
          }
        }
      }
    } catch (error) {
      console.error('Load history error:', error);
    }
  };

  const handleStartNewChat = () => {
    setChatId(null);
    setMessages([]);
    setIsChatEnded(false);
    setQueuePosition(null);
    setRatingValue(0);
    setRatingHover(0);
    setRatingComment('');
    setRatingSubmitted(false);
  };

  const handleSubmitRating = async () => {
    if (!ratingValue || !chatId || !userId) return;
    setIsRatingSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          chat_id: chatId,
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

  return (
    <div className="chat-widget-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className="chat-widget-toast">
          <span>{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '' })} className="chat-toast-close">×</button>
        </div>
      )}

      {/* Chat Button */}
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

      {/* Chat Window */}
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

          {/* Registration Form */}
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
                {messages.length === 0 && (
                  <div className="chat-empty-state">
                    <div className="chat-empty-icon">💬</div>
                    <h5>How can we help you?</h5>
                    <p>Send us a message and a support agent will reply right away.</p>
                  </div>
                )}

                {messages.map((msg, index) => {
                  const isSent = msg.sender_id === userId;
                  const isBot = msg.sender_role === 'bot';
                  const hasAttachment = msg.attachment_url;
                  return (
                    <div
                      key={index}
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
                  );
                })}

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
              {!isChatEnded && messages.length === 0 && (
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
