import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const EndChatDialog = ({ open, loading, onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>End Conversation</DialogTitle>

    <DialogContent>
      <DialogContentText>
        Are you sure you want to end this conversation? This action cannot be undone.
        Your status will also be set to &quot;Available&quot; and you will be navigated to the
        Queue page.
      </DialogContentText>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button onClick={onCancel} variant="outlined" disabled={loading}>
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
        {loading ? 'Ending…' : 'End Chat'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EndChatDialog;
