import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Fade,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';

/** Detect HTML content vs plain text */
const isHtmlContent = (str) => typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str);

/**
 * Render a message body — HTML (from rich text editor) or plain text.
 * Only allows safe inline/block tags.
 */
const RichMessageContent = ({ text, isSender }) => {
  if (!text) return null;
  if (isHtmlContent(text)) {
    return (
      <Box
        sx={{
          fontSize: '0.9rem',
          lineHeight: 1.55,
          wordBreak: 'break-word',
          '& p': { margin: 0 },
          '& p + p': { marginTop: '4px' },
          '& strong': { fontWeight: 700 },
          '& em': { fontStyle: 'italic' },
          '& s': { textDecoration: 'line-through' },
          '& code': {
            fontFamily: 'monospace',
            background: isSender ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.07)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.82em',
          },
          '& ul, & ol': { margin: '2px 0', paddingLeft: '1.4em' },
          '& li': { margin: '2px 0' },
          '& a': {
            color: isSender ? 'rgba(255,255,255,0.9)' : 'primary.main',
            textDecoration: 'underline',
          },
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return (
    <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {text}
    </Typography>
  );
};

const TypingIndicator = ({ userName }) => {
  const theme = useTheme();
  return (
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
              background: theme.vars.palette.background.paper,
              borderRadius: '20px 20px 20px 4px',
              border: `1px solid ${theme.vars.palette.divider}`,
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
                    background: 'linear-gradient(135deg, var(--palette-primary-main) 0%, var(--palette-primary-light) 100%)',
                    animation: 'typingBounce 1.4s infinite ease-in-out',
                    animationDelay: `${i * 0.16}s`,
                    boxShadow: '0 2px 4px rgba(var(--palette-primary-mainChannel) / 0.3)'
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
};

const AgentTypingIndicator = () => (
  <Fade in timeout={200}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        gap: 1,
        mb: 1,
        pr: 0.5
      }}
    >
      <Paper
        elevation={0}
        sx={{
          py: 1,
          px: 2,
          background: 'linear-gradient(135deg, var(--palette-primary-main) 0%, var(--palette-primary-dark) 100%)',
          borderRadius: '20px 20px 4px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', py: 0.25 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.85)',
                animation: 'typingBounce 1.4s infinite ease-in-out',
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </Box>
      </Paper>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '10px', mb: 0.5 }}>
        you
      </Typography>
    </Box>
  </Fade>
);

const formatSeenTime = (timestamp) => {
  const seenDate = new Date(timestamp);
  const diffMs = Date.now() - seenDate.getTime();
  if (diffMs < 60000) return 'just now';
  return seenDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const MessagesAreaSection = ({ messages, messagesEndRef, isLoading = false, isTyping = false, typingUser = '', isAgentTyping = false, lastSeenAt = null }) => {
  const theme = useTheme();

  const areaBg = theme.vars.palette.background.default;

  if (isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: areaBg
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
        background: areaBg,
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
          background: theme.vars.palette.action.selected,
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: theme.vars.palette.text.disabled,
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
              background: theme.vars.palette.action.hover,
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

      {(() => {
        const lastSeenSentIdx = lastSeenAt
          ? messages.reduce((acc, m, i) => {
            if (m.isSender && m.created_at && new Date(m.created_at) <= new Date(lastSeenAt)) return i;
            return acc;
          }, -1)
          : -1;

        return messages.map((msg, index) => {
          const showAvatar = index === 0 || messages[index - 1]?.isSender !== msg.isSender;
          const showSeen = Boolean(lastSeenAt) && msg.isSender && index === lastSeenSentIdx;

          if (msg.isSystemMsg) {
            return (
              <Fade in key={msg.id} timeout={300}>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '11px',
                      fontStyle: 'italic',
                      bgcolor: theme.vars.palette.action.hover,
                      px: 2,
                      py: 0.5,
                      borderRadius: '20px',
                      border: `1px solid ${theme.vars.palette.divider}`
                    }}
                  >
                    {msg.message}
                  </Typography>
                </Box>
              </Fade>
            );
          }

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
                          bgcolor: msg.isBot ? 'secondary.main' : 'text.secondary',
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
                      <RobotOutlined style={{ fontSize: 11, color: theme.vars.palette.text.secondary }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.vars.palette.text.secondary,
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
                          ? 'rgba(var(--palette-text-secondaryChannel) / 0.08)'
                          : 'background.paper',
                      color: msg.isSender ? 'white' : 'text.primary',
                      borderRadius: msg.isSender
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      border: msg.isBot
                        ? '1px dashed rgba(var(--palette-text-secondaryChannel) / 0.3)'
                        : msg.isSender
                          ? 'none'
                          : `1px solid ${theme.vars.palette.divider}`,
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
                      <RichMessageContent text={msg.message} isSender={msg.isSender} />
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

                  {showSeen && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        color: 'primary.main',
                        fontSize: '10px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.25
                      }}
                    >
                      <svg width="14" height="10" viewBox="0 0 16 11" fill="none" style={{ verticalAlign: 'middle' }}>
                        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Seen {formatSeenTime(lastSeenAt)}
                    </Typography>
                  )}
                </Box>

                {msg.isSender && <Box sx={{ width: 32, flexShrink: 0 }} />}
              </Box>
            </Fade>
          );
        });
      })()}

      {/* Typing indicator — client is typing */}
      {isTyping && <TypingIndicator userName={typingUser} />}
      {/* Agent typing indicator — shown while composing */}
      {isAgentTyping && !isTyping && <AgentTypingIndicator />}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessagesAreaSection;
