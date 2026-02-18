import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Button, 
  useTheme, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  MenuItem,
  Stack
} from '@mui/material';
import { EditOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import Editor from '../../components/Editor';
import TicketsAPI from '../../api/tickets';

const TicketDetailView = ({ ticket, onBack, onUpdate }) => {
  const theme = useTheme();
  const palette = theme.palette;
  const warning = palette.warning.main;
  const danger = palette.error.main;
  const info = palette.info.main;

  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState(ticket.description || '');
  const [formData, setFormData] = useState({
    id: ticket.id,
    title: ticket.title || ticket.subject,
    description: ticket.description || '',
    priority: ticket.priority,
    status: ticket.status
  });

  const handleOpenModal = () => {
    setFormData({
      id: ticket.id,
      title: ticket.title || ticket.subject,
      description: description,
      priority: ticket.priority,
      status: ticket.status
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      id: ticket.id,
      title: ticket.title || ticket.subject,
      description: description,
      priority: ticket.priority,
      status: ticket.status
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await TicketsAPI.updateTicket(formData.id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status
      });
      setDescription(formData.description);
      setOpenModal(false);
      if (onUpdate) {
        onUpdate(formData);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'new':
        return palette.primary.main;
      case 'in_progress':
        return info;
      case 'closed':
        return palette.grey[500];
      default:
        return palette.grey[500];
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'high':
        return danger;
      case 'medium':
        return warning;
      case 'low':
        return palette.success.main;
      default:
        return palette.grey[500];
    }
  };

  return (
    <React.Fragment>
      <Breadcrumbs links={[{ title: 'Home', to: '/' }, { title: 'Tickets', to: '/portal/tickets' }, { title: `#${ticket.id}` }]} />
      <Box sx={{  bgcolor: palette.background.default, minHeight: '100vh' }}>
        <Box sx={{ mb: 2 }}>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h1" color="initial"  sx={{ mb: 6 }}>
              {ticket.title || ticket.subject}
            </Typography>
            <Typography variant="h6" color="initial">{`Ticket ID: ${ticket.id}`}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Typography>Priority:</Typography>
              <Chip
                label={ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                size="small"
                sx={{
                  bgcolor: getPriorityColor(ticket.priority),
                  color: palette.common.white,
                  fontWeight: 600
                }}
              />
              <Typography>Status:</Typography>
              <Chip
                size="small"
                label={ticket.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                sx={{
                  bgcolor: getStatusColor(ticket.status),
                  color: palette.common.white,
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<EditOutlined />} 
              sx={{ textTransform: 'none' }}
              onClick={handleOpenModal}
            >
              Edit
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ color: palette.text.primary, lineHeight: 1.8 }}>
              Description:
            </Typography>
            <Editor
              value={description}
              editable={false}
              showToolbar={false}
              minHeight={260}
            />
          </Paper>

          <Paper sx={{ p: 3, alignSelf: 'start', position: 'sticky', top: 80  }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 1 }}>
                Created At
              </Typography>
              <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                {ticket.created_at ? new Date(ticket.created_at).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                }) : 'N/A'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 1 }}>
                Updated At
              </Typography>
              <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                }) : 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Edit Ticket Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">Edit Ticket</Typography>
            <Button 
              onClick={handleCloseModal}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <CloseOutlined />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Ticket ID"
              value={formData.id}
              disabled
            />
            
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
            
            <Box>
              <Typography variant="caption" sx={{ color: palette.text.secondary, mb: 1, display: 'block' }}>
                Description
              </Typography>
              <Editor
                value={formData.description}
                onChange={(content) => handleInputChange('description', content)}
                editable={true}
                showToolbar={true}
                minHeight={150}
              />
            </Box>
            
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default TicketDetailView;
