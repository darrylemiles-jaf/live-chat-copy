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
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import Editor from '../../components/Editor';

const TicketDetailView = ({ ticket }) => {
  const theme = useTheme();
  const palette = theme.palette;
  const warning = palette.warning.main;
  const danger = palette.error.main;
  const info = palette.info.main;
  
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description || '',
    priority: ticket.priority,
    status: ticket.status,
    assignee: ticket.assignee,
    email: ticket.email || ''
  });

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // Reset form data
    setFormData({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      assignee: ticket.assignee,
      email: ticket.email || ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save logic here - you can add API call
    console.log('Saving ticket with data:', formData);
    setOpenModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return info;
      case 'Pending':
        return warning;
      case 'In Progress':
        return palette.primary.main;
      case 'Resolved':
        return palette.success.main;
      default:
        return palette.grey[500];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return danger;
      case 'Medium':
        return warning;
      case 'Low':
        return palette.success.main;
      default:
        return palette.grey[500];
    }
  };

  return (
    <React.Fragment>
      <Breadcrumbs links={[{ title: 'Home', to: '/' }, { title: 'Tickets', to: '/portal/tickets' }, { title: `#${ticket.id}` }]} />
      <Box sx={{ mt: 3, bgcolor: palette.background.default, minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h1" color="initial">
              {ticket.subject}
            </Typography>
            <Typography variant="h6" color="initial">{`Ticket ID: ${ticket.id}`}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Typography>Priority:</Typography>
              <Chip
                label={ticket.priority}
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
                label={ticket.status}
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
              value={`
<h3>Ticket Creation Guidelines</h3>
<p>Please review the ticket submission requirements before continuing.</p>

${ticket.description ? `<p>${ticket.description}</p>` : ''}

<h2>Support Ticket Submission Policy</h2>
<p><strong>Effective Date:</strong> February 16, 2026</p>

<h4>1. Purpose</h4>
<p>This policy ensures new tickets include the details required for fast triage, accurate routing, and clear accountability.</p>

<h4>2. Required Information</h4>
<ul>
  <li>A concise subject that summarizes the issue.</li>
  <li>A clear description with steps to reproduce, if applicable.</li>
  <li>Impact level and expected business effect.</li>
  <li>Current environment details (app version, device, browser).</li>
</ul>

<h4>3. Priority Guidelines</h4>
<p>Use High only for outages, data loss, or security incidents. Medium covers degraded workflows. Low is for cosmetic or minor issues.</p>

<h4>4. Sensitive Data</h4>
<p>Do not include passwords, full payment data, or private customer identifiers in ticket descriptions.</p>

<h4>5. Response Expectations</h4>
<p>The support team will confirm receipt and assign an owner. Updates are posted on the ticket timeline.</p>
`}
              editable={false}
              showToolbar={false}
              minHeight={260}
            />
          </Paper>

          <Paper sx={{ p: 3, alignSelf: 'start', position: 'sticky', top: 80 }}>
            <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 2 }}>
              Assignee
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: palette.grey[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: palette.text.secondary
                }}
              >
                {(ticket.assignee || 'NA').slice(0, 2).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {ticket.assignee}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                  Assignee
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 1 }}>
                Updated
              </Typography>
              <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                {ticket.updatedAt}
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
              label="Subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
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
              label="Assignee"
              value={formData.assignee}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
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
