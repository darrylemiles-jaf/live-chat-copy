import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ReusableTable from '../../components/ReusableTable';
import TicketDetailView from '../../sections/tickets/TicketDetailView';
import ConvertDate from '../../components/ConvertDate';
import Editor from '../../components/Editor';
import { customGreen } from '../../themes/palette';
import agent, { useGetTickets } from '../../api/tickets';
import { API_URL } from '../../constants/constants';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Tickets' }];

const Tickets = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    priority: '',
    status: '',   
    assignee: '',
    email: ''
  });
  
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { tickets, ticketsLoading, ticketsError } = useGetTickets({});

  const handleViewClick = (ticket) => {
    navigate(`/portal/tickets/${encodeURIComponent(ticket.id)}`);
  };

  const handleEditClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      assignee: '',
      email: ''
    });
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleCreateClick = () => {
    setSelectedTicket(null);
    setFormData({
      id: '',
      title: '',
      description: '',
      priority: 'low',
      status: 'new',
      assignee: '',
      email: ''
    });
    setModalMode('create');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTicket(null);
    setFormData({});
    setModalMode('view');
    setModalError(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAssigneeChange = (event, newValue) => {
    if (newValue) {
      setFormData((prev) => ({ 
        ...prev, 
        assignee: newValue.name,
        email: newValue.email,
        avatar: newValue.avatar
      }));
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        assignee: '',
        email: '',
        avatar: ''
      }));
    }
  };
  
  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };
  
  const stripHtml = useCallback((html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }, []);

  const handleSave = async () => {
    try {
      setModalError(null);
      
      if (modalMode === 'create') {
        const payload = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority
        };
        
        const response = await agent.addTicket(payload);
        if (response.success) {
          const ticketsKey = `${API_URL}/api/${import.meta.env.VITE_API_VER}/tickets`;
          mutate([ticketsKey, {}]);
          setSnackbar({
            open: true,
            message: 'Ticket created successfully!',
            severity: 'success'
          });
          handleCloseModal();
        }
      } else if (modalMode === 'edit') {
        const payload = {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority
        };
        
        const response = await agent.updateTicket(formData.id, payload);
        if (response.success) {
          const ticketsKey = `${API_URL}/api/${import.meta.env.VITE_API_VER}/tickets`;
          mutate([ticketsKey, {}]);
          setSnackbar({
            open: true,
            message: 'Ticket updated successfully!',
            severity: 'success'
          });
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error('Error saving ticket:', err);
      setModalError(err.message || 'Failed to save ticket');
    }
  };

  const getPriorityColor = useCallback((priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'new':
        return 'primary';
      case 'in_progress':
        return 'info';
      case 'closed':
        return 'default';
  
    }
  }, []);

  const columns = useMemo(
    () => [
      { id: 'id', label: 'Ticket ID', minWidth: 120, align: 'left' },
      { id: 'title', label: 'Title', minWidth: 220, align: 'left' },
      {
        id: 'priority',
        label: 'Priority',
        minWidth: 120,
        renderCell: (row) => (
          <Chip size="small" label={row.priority?.charAt(0).toUpperCase() + row.priority?.slice(1)} color={getPriorityColor(row.priority)} sx={{ minWidth: 92, justifyContent: 'center' }} />
        )
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        renderCell: (row) => (
          <Chip size="small" label={row.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} color={getStatusColor(row.status)} sx={{ minWidth: 108, justifyContent: 'center' }} />
        )
      },
      {
        id: 'updated_at',
        label: 'Updated At',
        minWidth: 120,
        renderCell: (row) => (
          <ConvertDate dateString={row.updated_at} time />
        )
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 120,
        align: 'center',
        renderCell: (row) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title="View">
              <IconButton size="small" color="info" onClick={() => handleViewClick(row)}>
                <EyeOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update">
              <IconButton size="small" color="warning" onClick={() => handleEditClick(row)}>
                <EditOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    [getPriorityColor, getStatusColor]
  );

  const rows = useMemo(
    () => tickets,
    [tickets]
  );

  const ticketInView = useMemo(
    () => (ticketId ? rows.find((row) => row.id === parseInt(ticketId, 10)) : null),
    [rows, ticketId]
  );

  const handleTicketUpdate = (updatedTicket) => {
    const ticketsKey = `${API_URL}/api/${import.meta.env.VITE_API_VER}/tickets`;
    mutate([ticketsKey, {}]);
    setSnackbar({ open: true, message: 'Ticket updated successfully!', severity: 'success' });
  };

  return (
    <React.Fragment>
      {ticketId && ticketInView ? (
        <>
          <TicketDetailView 
            ticket={ticketInView} 
            onBack={() => navigate('/portal/tickets')} 
            onUpdate={handleTicketUpdate}
          />
        </>
      ) : (
        <>
          <Breadcrumbs heading="Tickets" links={breadcrumbLinks} subheading="View and manage your tickets here." />
          {ticketsError && <Alert severity="error" sx={{ mb: 2 }}>{ticketsError.message || 'Failed to load tickets'}</Alert>}
          <ReusableTable
            columns={columns}
            rows={rows}
            searchableColumns={['id', 'title', 'priority', 'status']}
            settings={{
              orderBy: 'updated_at',
              order: 'desc',
              otherActionButton: (
                <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={handleCreateClick} >
                  Create Ticket
                </Button>
              )
            }}
          />
          <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
            <DialogTitle>
              {modalMode === 'create' ? 'Create Ticket' : modalMode === 'edit' ? 'Update Ticket' : 'View Ticket'}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {modalMode !== 'create' && (
                  <TextField
                    label="Ticket ID"
                    value={formData.id || ''}
                    placeholder="TCK-0000"
                    disabled
                    fullWidth
                  />
                )}
                <TextField
                  label="Title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleFormChange}
                  disabled={modalMode === 'view'}
                  placeholder="Enter ticket title"
                  fullWidth
                />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                    Description
                  </Typography>
                  <Editor
                    value={formData.description || ''}
                    onChange={handleDescriptionChange}
                    editable={modalMode !== 'view'}
                    showToolbar={modalMode !== 'view'}
                    minHeight={150}
                  />
                </Box>
                <Autocomplete
                  options={assigneeOptions}
                  getOptionLabel={(option) => option.name}
                  value={assigneeOptions.find(opt => opt.name === formData.assignee) || null}
                  onChange={handleAssigneeChange}
                  disabled={modalMode === 'view'}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: customGreen[0],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: customGreen[7],
                          fontSize: '14px'
                        }}
                      >
                        {option.name.charAt(0).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{option.email}</Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assignee"
                      placeholder="Select assignee"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: customGreen[5],
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: customGreen[7],
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: customGreen[7],
                        },
                      }}
                    />
                  )}
                  fullWidth
                  sx={{
                    '& .MuiAutocomplete-popupIndicator': {
                      color: customGreen[6],
                    },
                    '& .MuiAutocomplete-clearIndicator': {
                      color: customGreen[6],
                    },
                  }}
                />
           
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority || ''}
                    onChange={handleFormChange}
                    disabled={modalMode === 'view'}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status || ''}
                    onChange={handleFormChange}
                    disabled={modalMode === 'view'}
                    label="Status"
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="inherit">
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {modalMode !== 'view' && (
                <Button onClick={handleSave} variant="contained" color="primary">
                  {modalMode === 'create' ? 'Create Ticket' : 'Save Changes'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default Tickets;
