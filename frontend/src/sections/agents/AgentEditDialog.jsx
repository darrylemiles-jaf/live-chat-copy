import React from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const AgentEditDialog = ({ open, formData, onClose, onSave, onFormChange }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: 'warning.dark', fontWeight: 700 }}>Update Agent</DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField label="Agent ID" value={formData.id || ''} placeholder="AGT-0000" disabled fullWidth />
        <TextField
          label="Name"
          name="name"
          value={formData.name || ''}
          onChange={onFormChange}
          placeholder="Full name"
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email || ''}
          onChange={onFormChange}
          placeholder="Email address"
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select name="role" value={formData.role || ''} onChange={onFormChange} label="Role">
            <MenuItem value="Agent">Agent</MenuItem>
            <MenuItem value="Senior Agent">Senior Agent</MenuItem>
            <MenuItem value="Team Lead">Team Lead</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select name="status" value={formData.status || ''} onChange={onFormChange} label="Status">
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Busy">Busy</MenuItem>
            <MenuItem value="Away">Away</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancel</Button>
      <Button
        onClick={onSave}
        variant="contained"
        sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', fontWeight: 600, '&:hover': { bgcolor: 'warning.dark' } }}
      >
        Save Changes
      </Button>
    </DialogActions>
  </Dialog>
);

export default AgentEditDialog;
