import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, AlertTitle, IconButton, Slide } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons'

const SnackbarContext = createContext(undefined);

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export function SnackbarProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  const processQueue = useCallback(() => {
    if (queue.length > 0) {
      setCurrentMessage(queue[0]);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [queue]);

  useEffect(() => {
    if (queue.length > 0 && !currentMessage) {
      processQueue();
    }
  }, [queue, currentMessage, processQueue]);

  const showSnackbar = useCallback((message, severity = 'info', options) => {
    const id = Date.now().toString();
    const newMessage = {
      id,
      message,
      severity,
      title: options?.title,
      duration: options?.duration ?? (severity === 'error' ? 8000 : 6000),
      action: options?.action,
      anchorOrigin: options?.anchorOrigin,
    };

    setQueue((prev) => [...prev, newMessage]);
  }, []);

  const handleClose = useCallback((_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    setCurrentMessage(null);
  }, []);

  const closeSnackbar = useCallback(() => {
    setOpen(false);
  }, []);

  const value = {
    showSnackbar,
    closeSnackbar,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={currentMessage?.id}
        open={open}
        autoHideDuration={currentMessage?.duration}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        TransitionComponent={SlideTransition}
        anchorOrigin={currentMessage?.anchorOrigin || { vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
          },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={currentMessage?.severity}
          variant="standard"
          elevation={6}
          action={
            currentMessage?.action || (
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <CloseOutlined />
              </IconButton>
            )
          }
          sx={{
            width: '100%',
            minWidth: { xs: '280px', sm: '380px' },
            maxWidth: '380px',
            '& .MuiAlert-message': {
              width: '100%',
            },
            '& .MuiAlert-icon': {
              fontSize: '24px',
            },
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          }}
        >
          {currentMessage?.title && (
            <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
              {currentMessage.title}
            </AlertTitle>
          )}
          {currentMessage?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
