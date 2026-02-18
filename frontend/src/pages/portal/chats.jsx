import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ChatListSection from '../../sections/chats/ChatListSection';
import ChatHeaderSection from '../../sections/chats/ChatHeaderSection';
import MessagesAreaSection from '../../sections/chats/MessagesAreaSection';
import MessageInputSection from '../../sections/chats/MessageInputSection';
import EmptyStateSection from '../../sections/chats/EmptyStateSection';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: `Chats` }
];

// Fake chat data
const fakeChatList = [
  {
    id: 1,
    name: 'Meow',
    lastMessage: 'Messages and calls are secured with end-to-end encr...',
    timestamp: '6m',
    avatar: '/src/assets/images/users/avatar-1.png',
    unread: 0,
    online: true
  },
  {
    id: 2,
    name: 'Dave Spencer Sanchez Bacay',
    lastMessage: 'You: san na',
    timestamp: '6m',
    avatar: '/src/assets/images/users/avatar-2.png',
    unread: 0,
    online: true
  },
  {
    id: 3,
    name: '"Carry On" Basketball Club',
    lastMessage: 'Kuya Rupert: Kapag puno dun ka naglilista gol...',
    timestamp: '8m',
    avatar: '/src/assets/images/users/avatar-3.png',
    unread: 2,
    online: false
  },
  {
    id: 4,
    name: 'Shannon Paul Navarro Giron',
    lastMessage: 'Shannon Paul missed your call',
    timestamp: '1h',
    avatar: '/src/assets/images/users/avatar-4.png',
    unread: 0,
    online: false
  },
  {
    id: 5,
    name: 'Godofredo Bitoon Perez III',
    lastMessage: 'Messages and calls are secured with end-to-end encry...',
    timestamp: '2h',
    avatar: '/src/assets/images/users/avatar-5.png',
    unread: 0,
    online: false
  },
  {
    id: 6,
    name: 'Armelo Bacay',
    lastMessage: 'Messages and calls are secured with end-to-end e...',
    timestamp: '2h',
    avatar: '/src/assets/images/users/avatar-6.png',
    unread: 1,
    online: true
  },
  {
    id: 7,
    name: 'Darryle Miles Sanchez Bacay',
    lastMessage: 'Messages and calls are secured with end-to-end encry...',
    timestamp: '5h',
    avatar: '/src/assets/images/users/avatar-7.png',
    unread: 0,
    online: false
  },
  {
    id: 8,
    name: 'Dugo ni Mando at Flory (Bacay Fam)',
    lastMessage: 'Angelyn: happy birthday baby ela 🙏🙏🙏',
    timestamp: '6h',
    avatar: '/src/assets/images/users/avatar-8.png',
    unread: 3,
    online: false
  }
];

// Fake messages data for each chat
const fakeMessagesData = {
  1: [
    { id: 1, sender: 'Meow', message: 'Hi there! How are you?', timestamp: '10m ago', isSender: false },
    { id: 2, sender: 'You', message: 'I\'m good, thanks! How about you?', timestamp: '8m ago', isSender: true },
    { id: 3, sender: 'Meow', message: 'Doing great! Just wanted to check in.', timestamp: '6m ago', isSender: false }
  ],
  2: [
    { id: 1, sender: 'Dave Spencer Sanchez Bacay', message: 'login POST public', timestamp: '9m ago', isSender: false },
    { id: 2, sender: 'Dave Spencer Sanchez Bacay', message: '- auth middleware\n- getUsers\n- getSingleUser (by dynamic key)\n- updateUser\n- archiveUser\n- user account activation using email (sa email may activate button)', timestamp: '9m ago', isSender: false },
    { id: 3, sender: 'Dave Spencer Sanchez Bacay', message: 'users\n- id\n- first name\n- middle name (optional)\n- last name\n- email address\n- password\n- status (archived, activated, pending)', timestamp: '9m ago', isSender: false },
    { id: 4, sender: 'Dave Spencer Sanchez Bacay', message: 'pag ka nag register, pending muna tas ma activate sa email', timestamp: '9m ago', isSender: false },
    { id: 5, sender: 'Dave Spencer Sanchez Bacay', message: 'create ka rin ng middleware na mag .trim() lahat ng string values. para sure na string lahat naiinsert at hindi code tool', timestamp: '9m ago', isSender: false },
    { id: 6, sender: 'Dave Spencer Sanchez Bacay', message: 'gandahan mo code mo', timestamp: '9m ago', isSender: false },
    { id: 7, sender: 'You', message: 'google chat kaya', timestamp: '6m ago', isSender: true }
  ],
  3: [
    { id: 1, sender: 'Kuya Rupert', message: 'Kapag puno dun ka naglilista gol...', timestamp: '8m ago', isSender: false },
    { id: 2, sender: 'You', message: 'Okay noted!', timestamp: '7m ago', isSender: true }
  ],
  4: [
    { id: 1, sender: 'Shannon Paul Navarro Giron', message: 'Hey, tried calling you earlier', timestamp: '1h ago', isSender: false },
    { id: 2, sender: 'You', message: 'Sorry I missed it! What\'s up?', timestamp: '50m ago', isSender: true }
  ],
  5: [
    { id: 1, sender: 'Godofredo Bitoon Perez III', message: 'Can we schedule a meeting?', timestamp: '2h ago', isSender: false },
    { id: 2, sender: 'You', message: 'Sure! What time works for you?', timestamp: '2h ago', isSender: true }
  ],
  6: [
    { id: 1, sender: 'Armelo Bacay', message: 'Check out this link', timestamp: '2h ago', isSender: false },
    { id: 2, sender: 'You', message: 'Thanks! Will do', timestamp: '2h ago', isSender: true }
  ],
  7: [
    { id: 1, sender: 'Darryle Miles Sanchez Bacay', message: 'Happy birthday!', timestamp: '5h ago', isSender: false },
    { id: 2, sender: 'You', message: 'Thank you so much! 🎉', timestamp: '5h ago', isSender: true }
  ],
  8: [
    { id: 1, sender: 'Angelyn', message: 'happy birthday baby ela 🙏🙏🙏', timestamp: '6h ago', isSender: false },
    { id: 2, sender: 'Mando', message: 'God bless!', timestamp: '6h ago', isSender: false },
    { id: 3, sender: 'You', message: 'Thank you all! ❤️', timestamp: '6h ago', isSender: true }
  ]
};



// ============ MAIN COMPONENT ============
const Chats = () => {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMessages, setCurrentMessages] = useState([]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setCurrentMessages(fakeMessagesData[chat.id] || []);
  };

  // Auto-select chat from navigation state
  useEffect(() => {
    if (location.state?.chatId) {
      const chat = fakeChatList.find(c => c.id === location.state.chatId);
      if (chat) {
        handleSelectChat(chat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: 'You',
        message: message.trim(),
        timestamp: 'Just now',
        isSender: true
      };
      setCurrentMessages([...currentMessages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          chats={fakeChatList}
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
              <MessagesAreaSection messages={currentMessages} />
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