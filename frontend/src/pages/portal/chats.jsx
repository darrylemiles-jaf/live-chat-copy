import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ChatListSection from '../../sections/chats/ChatListSection';
import ChatHeaderSection from '../../sections/chats/ChatHeaderSection';
import MessagesAreaSection from '../../sections/chats/MessagesAreaSection';
import MessageInputSection from '../../sections/chats/MessageInputSection';
import EmptyStateSection from '../../sections/chats/EmptyStateSection';
import { getChats, getChatMessages, sendMessage } from '../../api/chatApi';
import socketService from '../../services/socketService';
import useAuth from '../../hooks/useAuth';

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
    name: chat.client_name || `User ${chat.client_id}`,
    lastMessage: chat.last_message || 'No messages yet',
    timestamp: formatTimestamp(chat.updated_at || chat.created_at),
    avatar: null, // Can be updated if you have avatars
    unread: 0, // Can be calculated if you track read status
    online: chat.status === 'active'
  };
};

const transformMessageData = (message, agentId) => {
  return {
    id: message.id,
    sender: message.sender_id === agentId ? 'You' : message.sender_name || `User ${message.sender_id}`,
    message: message.message,
    timestamp: formatTimestamp(message.created_at),
    isSender: message.sender_id === agentId
  };
};


// ============ MAIN COMPONENT ============
// ============ MAIN COMPONENT ============
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chats data
  const fetchChatsData = async () => {
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
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId) => {
    if (!chatId || !user?.id) return;

    try {
      const response = await getChatMessages(chatId);
      const transformedMessages = response.data.map(msg => transformMessageData(msg, user.id));
      setCurrentMessages(transformedMessages);

      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setCurrentMessages([]);
    }
  };

  // Initialize: fetch chats and connect socket
  useEffect(() => {
    if (!user?.id) return;

    fetchChatsData();

    // Connect socket
    const socket = socketService.connect();

    // Listen for new messages
    socket.on('new_message', (messageData) => {
      console.log('New message received:', messageData);

      // If message is for current chat, add it to messages
      if (selectedChat && messageData.chat_id === selectedChat.id) {
        const transformedMessage = transformMessageData(messageData, user.id);
        setCurrentMessages(prev => [...prev, transformedMessage]);
        setTimeout(scrollToBottom, 100);
      }

      // Refresh chat list to update last message
      fetchChatsData();
    });

    // Listen for chat assignments
    socket.on('chat_assigned', (chatData) => {
      console.log('Chat assigned:', chatData);
      fetchChatsData(); // Refresh chat list
    });

    // Listen for chat status updates
    socket.on('chat_status_update', (data) => {
      console.log('Chat status updated:', data);
      fetchChatsData();
    });

    return () => {
      socket.off('new_message');
      socket.off('chat_assigned');
      socket.off('chat_status_update');
    };
  }, [user?.id, selectedChat]);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat.id);

    // Join chat room via socket
    const socket = socketService.connect();
    socket.emit('join_chat', { chatId: chat.id, userId: user.id });
  };

  // Auto-select chat from navigation state
  useEffect(() => {
    if (location.state?.chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === location.state.chatId);
      if (chat) {
        handleSelectChat(chat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, chats]);

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user?.id) return;

    try {
      await sendMessage(user.id, message.trim(), selectedChat.id);
      setMessage('');

      // Message will be added via socket event, no need to add locally
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
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
        {/* Left Sidebar - Chat List */}
        <ChatListSection
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Right Side - Chat Window */}
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
              />
              <MessagesAreaSection messages={currentMessages} messagesEndRef={messagesEndRef} />
              <MessageInputSection
                message={message}
                onMessageChange={setMessage}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
              />
            </>
          ) : (
            <EmptyStateSection />
          )}
        </Box>
      </Paper>
    </React.Fragment>
  );
};

export default Chats;