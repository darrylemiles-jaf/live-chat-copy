import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatWidget.css';

const ChatWidget = ({ apiUrl = 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1', socketUrl = 'https://depauperate-destiny-superdelicate.ngrok-free.dev' }) => {
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

    socketRef.current.on('user_typing', ({ userName }) => {
      setAgentName(userName);
      setIsTyping(true);
    });

    socketRef.current.on('user_stop_typing', () => {
      setIsTyping(false);
    });

    socketRef.current.on('chat_status_update', ({ chatId: updatedChatId, status }) => {
      console.log('🔄 Widget received chat status update:', { chatId: updatedChatId, status });
      if (updatedChatId === chatIdRef.current && status === 'ended') {
        setIsChatEnded(true);
      }
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
        alert('Failed to register. Please try again.');
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
      alert('Failed to connect. Please try again.');
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
      socketRef.current.emit('typing', { chatId, userName });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { chatId });
      }, 1000);
    }
  };

  // Check if user info exists in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chat_widget_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      console.log('Loaded user from localStorage:', user);
      setUserId(user.id);
      setUserName(user.name);
      setUserEmail(user.email);
      setIsRegistered(true);
    } else {
      console.log('No saved user found in localStorage');
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
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-widget-container">
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
                  <label className="chat-field-label">Full name</label>
                  <input
                    type="text"
                    placeholder="e.g. Juan dela Cruz"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="chat-input-field"
                  />
                </div>
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
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                        <span className="chat-message-time">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="chat-typing-indicator">
                    <span>{agentName || 'Agent'} is typing</span>
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
                <form onSubmit={handleSendMessage} className="chat-widget-input">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message…"
                    className="chat-message-input"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="chat-send-button"
                    aria-label="Send message"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </form>
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
