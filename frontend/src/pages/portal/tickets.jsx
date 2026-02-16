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
  MenuItem
} from '@mui/material';
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ReusableTable from '../../components/ReusableTable';
import TicketDetailView from '../../sections/tickets/TicketDetailView';
import ConvertDate from '../../components/ConvertDate';
import Editor from '../../components/Editor';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Tickets' }];

const Tickets = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    subject: '',
    description: '',
    priority: '',
    status: '',
    assignee: '',
    email: ''
  });

  const handleViewClick = (ticket) => {
    navigate(`/portal/tickets/${encodeURIComponent(ticket.id)}`);
  };

  const handleEditClick = (ticket) => {
    setSelectedTicket(ticket);
    setFormData(ticket);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleCreateClick = () => {
    setSelectedTicket(null);
    setFormData({
      id: '',
      subject: '',
      description: '',
      priority: 'Medium',
      status: 'Open',
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
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleSave = () => {
    console.log(`${modalMode === 'create' ? 'Creating' : 'Updating'} ticket:`, formData);
    handleCloseModal();
  };

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Open':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'In Progress':
        return 'info';
      case 'Resolved':
        return 'success';
      default:
        return 'default';
    }
  }, []);

  const columns = useMemo(
    () => [
      { id: 'id', label: 'Ticket ID', minWidth: 120, align: 'left' },
      { id: 'subject', label: 'Subject', minWidth: 220, align: 'left' },
      {
        id: 'description',
        label: 'Description',
        minWidth: 250,
        align: 'left',
        renderCell: (row) => (
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="body2" noWrap>
              {row.description || '-'}
            </Typography>
          </Box>
        )
      },
      {
        id: 'assignee',
        label: 'Assignee',
        minWidth: 200,
        align: 'left',
        renderCell: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#1976d2',
                fontSize: '16px'
              }}
            >
              {row.assignee.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.assignee}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
            </Box>
          </Box>
        )
      },
      {
        id: 'priority',
        label: 'Priority',
        minWidth: 120,
        renderCell: (row) => (
          <Chip size="small" label={row.priority} color={getPriorityColor(row.priority)} sx={{ minWidth: 92, justifyContent: 'center' }} />
        )
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        renderCell: (row) => (
          <Chip size="small" label={row.status} color={getStatusColor(row.status)} sx={{ minWidth: 108, justifyContent: 'center' }} />
        )
      },
      {
        id: 'updatedAt',
        label: 'Updated At',
        minWidth: 120,
        renderCell: (row) => (
          <ConvertDate dateString={row.updatedAt} time />
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
    () => [
      {
        id: 'TCK-1001',
        subject: 'Login issue on mobile',
        description: 'Users cannot log in on Android after the latest release.',
        priority: 'High',
        status: 'Open',
        assignee: 'Amira Hassan',
        email: 'amira.hassan@company.com',
        avatar: '/images/users/avatar-1.png',
        updatedAt: '2026-02-10'
      },
      {
        id: 'TCK-1002',
        subject: 'Billing email not received',
        description: 'Customer reports missing invoice email and needs a resend.',
        priority: 'Medium',
        status: 'Pending',
        assignee: 'Jonas Cole',
        email: 'jonas.cole@company.com',
        avatar: '/images/users/avatar-2.png',
        updatedAt: '2026-02-09'
      },
      {
        id: 'TCK-1003',
        subject: 'Chat widget slow to load',
        description: 'Chat widget takes over 5 seconds to load on first visit.',
        priority: 'Low',
        status: 'Resolved',
        assignee: 'Priya Singh',
        email: 'priya.singh@company.com',
        avatar: '/images/users/avatar-3.png',
        updatedAt: '2026-02-08'
      },
      {
        id: 'TCK-1004',
        subject: 'Cannot export transcripts',
        description: 'Export transcripts feature returns error',
        priority: 'High',
        status: 'Open',
        assignee: 'Mason Ortiz',
        email: 'mason.ortiz@company.com',
        avatar: '/images/users/avatar-4.png',
        updatedAt: '2026-02-07'
      },
      {
        id: 'TCK-1005',
        subject: 'Notifications not syncing',
        description: 'Notifications not appearing across devices',
        priority: 'Medium',
        status: 'In Progress',
        assignee: 'Lina Park',
        email: 'lina.park@company.com',
        avatar: '/images/users/avatar-5.png',
        updatedAt: '2026-02-06'
      }
    ],
    []
  );

  const ticketInView = useMemo(
    () => (ticketId ? rows.find((row) => row.id === ticketId) : null),
    [rows, ticketId]
  );

  return (
    <React.Fragment>
      {ticketId && ticketInView ? (
        <>
          <TicketDetailView ticket={ticketInView} onBack={() => navigate('/portal/tickets')} />
        </>
      ) : (
        <>
          <Breadcrumbs heading="Tickets" links={breadcrumbLinks} subheading="View and manage your tickets here." />
          <ReusableTable
            columns={columns}
            rows={rows}
            searchableColumns={['id', 'subject', 'description', 'priority', 'status', 'assignee']}
            settings={{
              orderBy: 'updatedAt',
              order: 'desc',
              otherActionButton: (
                <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={handleCreateClick} >
                  Create Ticket
                </Button>
              )
            }}
          />

      {/* Ticket Modal */}
          <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogTitle>
              {modalMode === 'create' ? 'Create Ticket' : modalMode === 'edit' ? 'Update Ticket' : 'View Ticket'}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
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
                  label="Subject"
                  name="subject"
                  value={formData.subject || ''}
                  onChange={handleFormChange}
                  disabled={modalMode === 'view'}
                  placeholder="Enter ticket subject"
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
                <TextField
                  label="Assignee"
                  name="assignee"
                  value={formData.assignee || ''}
                  onChange={handleFormChange}
                  disabled={modalMode === 'view'}
                  placeholder="Enter assignee name"
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleFormChange}
                  disabled={modalMode === 'view'}
                  placeholder="Enter email address"
                  fullWidth
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
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
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
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
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
    </React.Fragment>
  );
};

export default Tickets;
