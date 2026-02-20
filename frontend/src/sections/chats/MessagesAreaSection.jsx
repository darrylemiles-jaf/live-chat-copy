import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Fade,
  CircularProgress
} from '@mui/material';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';

const TypingIndicator = ({ userName }) => (
  <Fade in timeout={300}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        mb: 1,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: 'primary.main',
          fontSize: '0.875rem',
          boxShadow: '0 2px 8px rgba(0, 142, 134, 0.25)'
        }}
      >
        <UserOutlined />
      </Avatar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            mb: 0.5,
            px: 1,
            fontSize: '11px'
          }}
        >
          {userName || 'User'} is typing...
        </Typography>
        <Paper
          elevation={0}
          sx={{
            py: 1.5,
            px: 2.5,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px 20px 20px 4px',
            border: '1px solid rgba(0, 142, 134, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', py: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #008E86 0%, #3B7080 100%)',
                  animation: 'typingBounce 1.4s infinite ease-in-out',
                  animationDelay: `${i * 0.16}s`,
                  boxShadow: '0 2px 4px rgba(0, 142, 134, 0.3)'
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>
      <style>
        {`
          @keyframes typingBounce {
            0%, 80%, 100% { 
              transform: scale(0.85) translateY(0); 
              opacity: 0.5;
            }
            40% { 
              transform: scale(1.15) translateY(-10px); 
              opacity: 1;
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  </Fade>
);

const MessagesAreaSection = ({ messages, messagesEndRef, isLoading = false, isTyping = false, typingUser = '' }) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: { xs: 2, sm: 3 },
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#94a3b8',
        },
      }}
    >
      {messages.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            opacity: 0.7
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}
          >
            💬
          </Box>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      )}

      {messages.map((msg, index) => {
        const showAvatar = index === 0 || messages[index - 1]?.isSender !== msg.isSender;

        return (
          <Fade in key={msg.id} timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: msg.isSender ? 'flex-end' : 'flex-start',
                mb: 0.5,
                gap: 1,
                alignItems: 'flex-end'
              }}
            >
              {/* Avatar for received messages */}
              {!msg.isSender && (
                <Box sx={{ width: 32, flexShrink: 0 }}>
                  {showAvatar && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: msg.isBot ? '#3B7080' : '#64748b',
                        fontSize: '0.875rem'
                      }}
                    >
                      {msg.isBot ? <RobotOutlined /> : <UserOutlined />}
                    </Avatar>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  maxWidth: { xs: '85%', sm: '70%', md: '60%' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isSender ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Bot label */}
                {msg.isBot && showAvatar && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, px: 1 }}>
                    <RobotOutlined style={{ fontSize: 11, color: '#3B7080' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#3B7080',
                        fontWeight: 600,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Automated Reply
                    </Typography>
                  </Box>
                )}

                {/* Sender name for received messages */}
                {!msg.isSender && !msg.isBot && showAvatar && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 0.5,
                      px: 1,
                      fontSize: '11px'
                    }}
                  >
                    {msg.sender}
                  </Typography>
                )}

                {/* Message bubble */}
                <Paper
                  elevation={0}
                  sx={{
                    py: 1.25,
                    px: 2,
                    bgcolor: msg.isSender
                      ? 'primary.main'
                      : msg.isBot
                        ? 'rgba(59, 112, 128, 0.08)'
                        : '#ffffff',
                    color: msg.isSender ? 'white' : 'text.primary',
                    borderRadius: msg.isSender
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    border: msg.isBot
                      ? '1px dashed rgba(59, 112, 128, 0.3)'
                      : msg.isSender
                        ? 'none'
                        : '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: msg.isSender
                      ? '0 2px 8px rgba(0, 142, 134, 0.25)'
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  {/* Attachment display */}
                  {msg.attachment_url && (
                    <Box sx={{ mb: msg.message ? 1 : 0 }}>
                      {msg.attachment_type === 'image' ? (
                        <Box
                          component="a"
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'block' }}
                        >
                          <Box
                            component="img"
                            src={msg.attachment_url}
                            alt={msg.attachment_name || 'Image'}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: 200,
                              borderRadius: 1.5,
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.9 }
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          component="a"
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            bgcolor: msg.isSender ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                            borderRadius: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': {
                              bgcolor: msg.isSender ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Typography component="span" sx={{ fontSize: 20 }}>
                            {msg.attachment_type === 'video' ? '🎬' :
                              msg.attachment_type === 'audio' ? '🎵' :
                                msg.attachment_type === 'archive' ? '📦' : '📄'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 500,
                              wordBreak: 'break-all',
                              fontSize: '0.8rem'
                            }}
                          >
                            {msg.attachment_name || 'Download file'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                  {msg.message && (
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.5,
                        fontSize: '0.9rem'
                      }}
                    >
                      {msg.message}
                    </Typography>
                  )}
                </Paper>

                {/* Timestamp */}
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    px: 1,
                    color: 'text.disabled',
                    fontSize: '10px',
                    fontWeight: 500
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Box>

              {/* Avatar placeholder for sent messages (for alignment) */}
              {msg.isSender && <Box sx={{ width: 32, flexShrink: 0 }} />}
            </Box>
          </Fade>
        );
      })}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator userName={typingUser} />}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessagesAreaSection;
