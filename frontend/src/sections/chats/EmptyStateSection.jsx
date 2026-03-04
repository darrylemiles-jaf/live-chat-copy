import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';

const EmptyStateSection = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3,
        p: 4,
        background: theme.vars.palette.background.default
      }}
    >
      {/* Illustration */}
      <Box
        sx={{
          position: 'relative',
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Background circles */}
        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(var(--palette-primary-mainChannel) / 0.08) 0%, rgba(var(--palette-primary-mainChannel) / 0.03) 100%)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(var(--palette-primary-mainChannel) / 0.12) 0%, rgba(var(--palette-primary-mainChannel) / 0.05) 100%)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(var(--palette-primary-mainChannel) / 0.35)'
          }}
        >
          <MessageOutlined style={{ fontSize: 40, color: 'white' }} />
        </Box>

        {/* Floating elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'float 3s ease-in-out infinite'
          }}
        >
          <TeamOutlined style={{ fontSize: 18, color: theme.vars.palette.primary.main }} />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 10,
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'success.main',
            boxShadow: '0 4px 12px rgba(var(--palette-success-mainChannel) / 0.3)',
            animation: 'float 2.5s ease-in-out infinite 0.5s'
          }}
        />
      </Box>

      {/* Text content */}
      <Box sx={{ textAlign: 'center', maxWidth: 320 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          color="text.primary"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            mb: 1
          }}
        >
          Select a conversation
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            lineHeight: 1.6
          }}
        >
          Choose a chat from the list to view messages and continue the conversation
        </Typography>
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>
    </Box>
  );
};

export default EmptyStateSection;
