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
import { PlusOutlined } from '@ant-design/icons';
import { customGreen } from '../../themes/palette';

const AgentCreateDialog = ({ open, formData, onClose, onCreate, onFormChange }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: customGreen[8], fontWeight: 700 }}>Create New Agent</DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name || ''}
          onChange={onFormChange}
          placeholder="Full name"
          fullWidth
          required
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email || ''}
          onChange={onFormChange}
          placeholder="Email address"
          fullWidth
          required
          type="email"
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
        onClick={onCreate}
        variant="contained"
        startIcon={<PlusOutlined />}
        sx={{ bgcolor: customGreen[8], color: '#fff', fontWeight: 600, '&:hover': { bgcolor: customGreen[7] } }}
      >
        Create Agent
      </Button>
    </DialogActions>
  </Dialog>
);

export default AgentCreateDialog;
