import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatWidget.css';

const ChatWidget = ({ apiUrl = 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1/api/v1', socketUrl = 'https://depauperate-destiny-superdelicate.ngrok-free.dev' }) => {
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

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isRegistered) {
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Connected to chat server');
        setIsConnected(true);
        if (userId) {
          socketRef.current.emit('join', userId);
          console.log(`👤 Joined user room: user_${userId}`);
        }
        if (chatId) {
          socketRef.current.emit('join_chat', chatId);
          console.log(`💬 Joined chat room: chat_${chatId}`);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Disconnected from chat server');
        setIsConnected(false);
      });

      socketRef.current.on('new_message', (message) => {
        console.log('📨 New message received:', message);
        setMessages(prev => {
          // Prevent duplicates by checking if message with this ID already exists
          if (prev.some(msg => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      });

      socketRef.current.on('user_typing', ({ userName }) => {
        setAgentName(userName);
        setIsTyping(true);
      });

      socketRef.current.on('user_stop_typing', () => {
        setIsTyping(false);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isRegistered, userId, chatId, socketUrl]);

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
        headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
              // Check for duplicates
              if (prev.some(msg => msg.id === data.data.id)) {
                return prev;
              }
              return [...prev, data.data];
            });
            scrollToBottom();
          }
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
      const response = await fetch(`${apiUrl}/chats?user_id=${userId}`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        // Get the most recent chat
        const activeChat = data.data.find(chat =>
          chat.status === 'active' || chat.status === 'queued'
        ) || data.data[0];

        if (activeChat) {
          setChatId(activeChat.id);

          // Load messages for this chat
          if (activeChat.messages && activeChat.messages.length > 0) {
            setMessages(activeChat.messages);
          }
        }
      }
    } catch (error) {
      console.error('Load history error:', error);
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
            <div className="chat-header-info">
              <h3>Customer Support</h3>
              <span className={`chat-status ${isConnected ? 'online' : 'offline'}`}>
                {isConnected ? '● Online' : '○ Offline'}
              </span>
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
              <h4>Start a conversation</h4>
              <p>Please enter your details to continue</p>
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="chat-input-field"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="chat-input-field"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="chat-submit-button"
                >
                  {isLoading ? 'Connecting...' : 'Start Chat'}
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
                    <p>👋 Welcome! How can we help you today?</p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.sender_id === userId ? 'sent' : 'received'}`}
                  >
                    <div className="chat-message-content">
                      <p>{msg.message}</p>
                      <span className="chat-message-time">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                ))}

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

              {/* Input */}
              <form onSubmit={handleSendMessage} className="chat-widget-input">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="chat-message-input"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="chat-send-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
