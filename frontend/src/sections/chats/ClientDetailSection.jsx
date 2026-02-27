import React from 'react';
import { Box, Typography } from '@mui/material';

const statusStyles = {
  active: { bgcolor: '#dcfce7', color: '#16a34a' },
  queued: { bgcolor: '#fef3c7', color: '#d97706' },
  default: { bgcolor: '#f1f5f9', color: '#64748b' },
};

const ClientDetailSection = ({ selectedChat, messageCount }) => {
  const { bgcolor, color } =
    statusStyles[selectedChat.status] ?? statusStyles.default;

  const statusLabel =
    selectedChat.status.charAt(0).toUpperCase() + selectedChat.status.slice(1);

  return (
    <>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          Client Details
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Avatar + name + status */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'white',
              mb: 1,
            }}
          >
            {selectedChat.name.charAt(0).toUpperCase()}
          </Box>

          <Typography variant="subtitle2" fontWeight={700} textAlign="center">
            {selectedChat.name}
          </Typography>

          <Box
            sx={{
              mt: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor,
              color,
            }}
          >
            {statusLabel}
          </Box>
        </Box>

        {/* Contact info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.disabled"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Contact Info
          </Typography>

          <DetailRow label="Email">
            <Typography variant="body2" fontSize="0.8rem" sx={{ wordBreak: 'break-all' }}>
              {selectedChat.email || '—'}
            </Typography>
          </DetailRow>

          <DetailRow label="Username">
            <Typography variant="body2" fontSize="0.8rem">
              {selectedChat.username || '—'}
            </Typography>
          </DetailRow>

          <DetailRow label="Client ID">
            <Typography variant="body2" fontSize="0.8rem">
              #{selectedChat.client_id}
            </Typography>
          </DetailRow>
        </Box>

        <Box sx={{ height: 1, bgcolor: 'divider' }} />

        {/* Chat info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.disabled"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Chat Info
          </Typography>

          <DetailRow label="Chat ID">
            <Typography variant="body2" fontSize="0.8rem">
              #{selectedChat.id}
            </Typography>
          </DetailRow>

          <DetailRow label="Started">
            <Typography variant="body2" fontSize="0.8rem">
              {selectedChat.created_at
                ? new Date(selectedChat.created_at).toLocaleString()
                : selectedChat.timestamp}
            </Typography>
          </DetailRow>

          <DetailRow label="Last Activity">
            <Typography variant="body2" fontSize="0.8rem">
              {selectedChat.timestamp}
            </Typography>
          </DetailRow>

          <DetailRow label="Messages">
            <Typography variant="body2" fontSize="0.8rem">
              {messageCount}
            </Typography>
          </DetailRow>

          {selectedChat.agent_name && (
            <DetailRow label="Assigned Agent">
              <Typography variant="body2" fontSize="0.8rem">
                {selectedChat.agent_name}
              </Typography>
            </DetailRow>
          )}
        </Box>
      </Box>
    </>
  );
};

// ── Sub-component ─────────────────────────────────────────────────────────────
const DetailRow = ({ label, children }) => (
  <Box>
    <Typography variant="caption" color="text.disabled">
      {label}
    </Typography>
    {children}
  </Box>
);

export default ClientDetailSection;
