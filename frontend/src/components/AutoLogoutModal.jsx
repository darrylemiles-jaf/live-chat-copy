import { keyframes } from '@mui/system';
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { WarningOutlined } from '@ant-design/icons';

const pulse = keyframes`
  0%   { transform: scale(1);   opacity: 1;   }
  50%  { transform: scale(1.08); opacity: 0.8; }
  100% { transform: scale(1);   opacity: 1;   }
`;

/**
 * AutoLogoutModal
 *
 * Props:
 *   open          {boolean}  whether the modal is visible
 *   countdown     {number}   seconds remaining before forced logout
 *   onStayLoggedIn {Function} called when user clicks "Stay Logged In"
 */
export default function AutoLogoutModal({ open, countdown, onStayLoggedIn }) {
  const isUrgent = countdown <= 5;

  return (
    <Dialog
      open={open}
      /* prevent closing via backdrop click or ESC */
      onClose={() => {}}
      disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 380, width: '100%' } }}
    >
      {/* ── Title ───────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 0,
          color: 'warning.main'
        }}
      >
        <WarningOutlined style={{ fontSize: 22 }} />
        <Typography variant="h6" component="span" fontWeight={700}>
          Session Timeout Warning
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: '12px !important', textAlign: 'center' }}>
        {/* ── Description ─────────────────────────────────── */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          You have been inactive for a while. You will be logged out automatically if you do not
          respond.
        </Typography>

        {/* ── Circular countdown ───────────────────────────── */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            borderRadius: '50%',
            border: '4px solid',
            borderColor: isUrgent ? 'error.main' : 'warning.main',
            color: isUrgent ? 'error.main' : 'warning.main',
            mb: 3,
            animation: isUrgent ? `${pulse} 0.8s ease-in-out infinite` : 'none'
          }}
        >
          <Typography variant="h4" fontWeight={700} lineHeight={1}>
            {countdown}
          </Typography>
        </Box>

        <Typography variant="caption" display="block" color="text.secondary" mb={3}>
          seconds remaining
        </Typography>

        {/* ── Action button ────────────────────────────────── */}
        <Button variant="contained" color="primary" fullWidth onClick={onStayLoggedIn}>
          Stay Logged In
        </Button>
      </DialogContent>
    </Dialog>
  );
}
