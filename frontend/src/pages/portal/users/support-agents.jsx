import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { customGreen, customGold, customRed } from "../../../themes/palette";

import {  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';
import { useGetUsers } from '../../../api/users';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Support Agents' }
];

const SupportAgents = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', role: '', status: '', successfulAssists: 0 });
  const [agents, setAgents] = useState([]);
  
  
  const { users, usersLoading, usersError, usersMutate } = useGetUsers({ role: 'support' });
  
  
  useEffect(() => {
    if (users && users.length > 0) {
      const transformedAgents = users.map(user => ({
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture,
        role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Support',
        status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Available',
        successfulAssists: 0
      }));
      setAgents(transformedAgents);
    }
  }, [users]);

  const handleEditClick = () => {
    setFormData(selectedAgent);
    setOpenViewModal(false);
    setOpenEditModal(true);
  };

  const handleViewById = (agent) => {
    setSelectedAgent(agent);
    setOpenViewModal(true);
  };

  const theme = useTheme();

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedAgent(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setFormData({});
  };

  const handleCreateClick = () => {
    setFormData({ id: '', name: '', email: '', role: 'Agent', status: 'Available', successfulAssists: 0 });
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Update existing agent
    setAgents(agents.map((agent) => (agent.id === formData.id ? formData : agent)));
    console.log('Updating agent:', formData);
    handleCloseEditModal();
  };

  const handleCreate = () => {
    const maxId = Math.max(...agents.map((a) => parseInt(a.id.split('-')[1])));
    const newAgent = {
      ...formData,
      id: `AGT-${String(maxId + 1).padStart(4, '0')}`,
      successfulAssists: 0
    };
    setAgents([newAgent, ...agents]);
    console.log('Creating agent:', newAgent);
    handleCloseCreateModal();
  };

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Available':
        return { label: 'Available', color: '#4caf50' };
      case 'Away':
        return { label: 'Away', color: '#ffb300' };
      case 'Busy':
        return { label: 'Busy', color: '#f44336' };      
      default:
        return { label: status || 'Unknown', color: '#9e9e9e' };
    }
  }, []);

  const columns = useMemo(
    () => [
      
      {
        id: 'name',
        label: 'Name',
        minWidth: 220,
        align: 'left',
        renderCell: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#2e7d32',
                fontSize: '16px'
              }}
            >
              {row.name ? row.name.charAt(0).toUpperCase() : '-'}
            </Box>
            <Box>
              <Typography  
                sx={{ 
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                #{row.id}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
            </Box>
          </Box>
        )
      },
      { id: 'role', label: 'Role', minWidth: 140, align: 'left' },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        renderCell: (row) => {
          const info = getStatusColor(row.status);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} />
              <Typography variant="body2">{info.label}</Typography>
            </Box>
          );
        }
      },
      
    ],
    [getStatusColor]
  );

  const rows = useMemo(
    () => agents,
    [agents]
  );

  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const uniqueRoles = useMemo(() => Array.from(new Set(rows.map((r) => r.role))).sort(), [rows]);

  const mapStatusLabel = (rowStatus) => getStatusColor(rowStatus).label;

  const filteredRowsForTable = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (filterRole && r.role !== filterRole) return false;
      if (filterStatus) {
        const label = mapStatusLabel(r.status);
        if (label !== filterStatus) return false;
      }
      return true;
    });

    const weight = (r) => {
      const label = mapStatusLabel(r.status);
      if (label === 'Available') return 0;
      if (label === 'Busy') return 1;
      if (label === 'Away') return 2;
      return 3;
    };
    return filtered.slice().sort((a, b) => {
      const wa = weight(a);
      const wb = weight(b);
      if (wa !== wb) return wa - wb;
      return a.name.localeCompare(b.name);
    });
  }, [rows, filterRole, filterStatus]);

  const viewConfig = {
    avatar: {
      nameField: 'name',
      subtitleField: 'role'
    },
    stats: [
      {
        field: 'successfulAssists',
        label: 'Successful assists',
        defaultValue: 0
      }
    ],
    infoSections: [
      {
        title: 'Personal Information',
        columns: '1fr 1fr',
        fields: [
          {
            label: 'Member ID',
            field: 'id',
            valueStyle: { color: customGreen[5] }
          },
          {
            label: 'Email',
            field: 'email'
          },
          {
            label: 'Role',
            field: 'role'
          },
          {
            label: 'Status',
            render: (data) => {
              const info = getStatusColor(data.status);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} />
                  <Typography variant="body2" sx={{ color: customGreen[5] }}>
                    {info.label}
                  </Typography>
                </Box>
              );
            }
          }
        ]
      }
    ]
  };

  // Show loading state
  if (usersLoading) {
    return (
      <React.Fragment>
        <Breadcrumbs heading="Support Agents" links={breadcrumbLinks} subheading="View and manage your support agents here." />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </React.Fragment>
    );
  }

  // Show error state
  if (usersError) {
    return (
      <React.Fragment>
        <Breadcrumbs heading="Support Agents" links={breadcrumbLinks} subheading="View and manage your support agents here." />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading support agents: {usersError.message || 'Please try again later.'}
        </Alert>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Breadcrumbs heading="Support Agents" links={breadcrumbLinks} subheading="View and manage your support agents here." />
      
      <ReusableTable
        columns={columns}
        rows={filteredRowsForTable}
        searchableColumns={['id', 'name', 'email', 'role', 'status']}
        onRowClick={handleViewById}
        settings={{
          orderBy: '__originalOrder',
          order: 'asc',
          otherActionButton: (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Role</InputLabel>
                <Select value={filterRole} label="Role" onChange={(e) => setFilterRole(e.target.value)}>
                  <MenuItem value="">All Roles</MenuItem>
                  {uniqueRoles.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Busy">Busy</MenuItem>
                  <MenuItem value="Away">Away</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" color="inherit" onClick={() => { setFilterRole(''); setFilterStatus(''); }}>Clear</Button>
              <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={handleCreateClick}>
                Add Agent
              </Button>
            </Box>
          )
        }}
      />

      <Dialog open={openViewModal} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: customGreen[5], fontWeight: 700 }}>
          Agent Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <UserDetailsView
            data={selectedAgent}
            viewConfig={viewConfig}
            styles={{
              accentColor: customGreen[5],
              backgroundColor: customGreen[0]
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewModal} color="inherit">
            Close
          </Button>
          <Button
            onClick={handleEditClick}
            variant="contained"
            startIcon={<EditOutlined />}
            sx={{
              bgcolor: customGreen[8],
              color: '#fff',
              '&:hover': { bgcolor: customGreen[7] }
            }}
          >
            Edit Agent
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: customGold[7], fontWeight: 700 }}>Update Agent</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Agent ID" value={formData.id || ''} placeholder="AGT-0000" disabled fullWidth />
            <TextField
              label="Name"
              name="name"
              value={formData.name || ''}
              onChange={handleFormChange}
              placeholder="Full name"
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email || ''}
              onChange={handleFormChange}
              placeholder="Email address"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role || ''} onChange={handleFormChange} label="Role">
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Senior Agent">Senior Agent</MenuItem>
                <MenuItem value="Team Lead">Team Lead</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status || ''} onChange={handleFormChange} label="Status">
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Busy">Busy</MenuItem>
                <MenuItem value="Away">Away</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{
              bgcolor: customGold[5],
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: customGold[6] }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreateModal} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: customGreen[8], fontWeight: 700 }}>Create New Agent</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name || ''}
              onChange={handleFormChange}
              placeholder="Full name"
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email || ''}
              onChange={handleFormChange}
              placeholder="Email address"
              fullWidth
              required
              type="email"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role || ''} onChange={handleFormChange} label="Role">
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Senior Agent">Senior Agent</MenuItem>
                <MenuItem value="Team Lead">Team Lead</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status || ''} onChange={handleFormChange} label="Status">
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Busy">Busy</MenuItem>
                <MenuItem value="Away">Away</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            startIcon={<PlusOutlined />}
            sx={{
              bgcolor: customGreen[8],
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: customGreen[7] }
            }}
          >
            Create Agent
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default SupportAgents;