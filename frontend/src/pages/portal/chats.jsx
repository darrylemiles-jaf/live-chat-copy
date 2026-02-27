import React from 'react';
import {
  Box, Paper, CircularProgress, Typography, Grid,
  Snackbar, Alert
} from '@mui/material';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ChatListSection from '../../sections/chats/ChatListSection';
import ChatHeaderSection from '../../sections/chats/ChatHeaderSection';
import MessagesAreaSection from '../../sections/chats/MessagesAreaSection';
import MessageInputSection from '../../sections/chats/MessageInputSection';
import EmptyStateSection from '../../sections/chats/EmptyStateSection';
import ClientDetailSection from '../../sections/chats/ClientDetailSection';
import EndChatDialog from '../../sections/chats/EndChatDialog';
import useChats from '../../hooks/useChats';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Chats' },
];

const Chats = () => {
  const {
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
    messagesEndRef,
    setMessage,
    setSearchQuery,
    setStatusFilter,
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
    user,
  } = useChats();

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
      <PageHead title='Chats' description='Timora Live Chat, Chats Overview' />

      <Breadcrumbs
        heading="Chats"
        links={breadcrumbLinks}
        subheading="View and manage your chats here."
      />

      <Paper sx={{ height: { xs: 'calc(100vh - 150px)', md: 'calc(100vh - 200px)' }, overflow: 'hidden', mt: 2 }}>
        <Grid container sx={{ height: '100%' }}>

          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              height: '100%',
              borderRight: 1,
              borderColor: 'divider',
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
              minWidth: 0,
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
                    onMessageChange={(value) => { setMessage(value); handleTyping(); }}
                    onSendMessage={handleSendMessage}
                    onKeyPress={handleKeyPress}
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                    userName={user?.name}
                  />
                ) : (
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'action.disabledBackground', textAlign: 'center' }}>
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
                overflow: 'auto',
              }}
            >
              <ClientDetailSection
                selectedChat={selectedChat}
                messageCount={currentMessages.length}
              />
            </Grid>
          )}

        </Grid>
      </Paper>

      <EndChatDialog
        open={confirmDialog.open}
        loading={confirmDialog.loading}
        onConfirm={handleConfirmEnd}
        onCancel={handleCancelEnd}
      />

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