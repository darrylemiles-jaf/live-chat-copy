import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Support Agents' }
];

const SupportAgents = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', role: '', status: '' });

  const handleEditClick = (agent) => {
    setSelectedAgent(agent);
    setFormData(agent);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleCreateClick = () => {
    setSelectedAgent(null);
    setFormData({ id: '', name: '', email: '', role: 'Support Agent', status: 'Active' });
    setModalMode('create');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAgent(null);
    setFormData({});
    setModalMode('view');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log(`${modalMode === 'create' ? 'Creating' : 'Updating'} agent:`, formData);
    handleCloseModal();
  };

  const getStatusColor = useCallback((status) => {
    // Map existing status values to display label and color
    // User mapping: Available (green), Busy (yellow), Away (red)
    switch (status) {
      case 'Active':
        return { label: 'Available', color: '#4caf50' };
      case 'Inactive':
        return { label: 'Away', color: '#f44336' };
      case 'Suspended':
        return { label: 'Busy', color: '#ffb300' };
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
              <Typography  sx={{ fontWeight: 600 }}>#{row.id}</Typography>
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
    () => [
      { id: 'AGT-1001', name: 'Amira Hassan', email: 'amira.hassan@company.com', role: 'Senior Agent', status: 'Active' },
      { id: 'AGT-1002', name: 'Jina Cole', email: 'jonas.cole@company.com', role: 'Agent', status: 'Active' },
      { id: 'AGT-1003', name: 'Priya Singh', email: 'priya.singh@company.com', role: 'Agent', status: 'Suspended' },
      { id: 'AGT-1004', name: 'Mason Ortiz', email: 'mason.ortiz@company.com', role: 'Team Lead', status: 'Active' },
      { id: 'AGT-1005', name: 'Lina Park', email: 'lina.park@company.com', role: 'Agent', status: 'Inactive' }
    ],
    []
  );

  // Filter state
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

    // Order: Available -> Busy -> Away -> others
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

  return (
    <React.Fragment>
      <Breadcrumbs heading="Support Agents" links={breadcrumbLinks} subheading="View and manage your support agents here." />
      <ReusableTable
        columns={columns}
        rows={filteredRowsForTable}
        searchableColumns={['id', 'name', 'email', 'role', 'status']}
        settings={{
          // Use a non-existent orderBy key so ReusableTable's internal sort
          // leaves our pre-sorted `rows` order unchanged.
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
                Create Agent
              </Button>
            </Box>
          )
        }}
      />

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === 'create' ? 'Create Agent' : modalMode === 'edit' ? 'Update Agent' : 'View Agent'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {modalMode !== 'create' && (
              <TextField label="Agent ID" value={formData.id || ''} placeholder="AGT-0000" disabled fullWidth />
            )}
            <TextField label="Name" name="name" value={formData.name || ''} onChange={handleFormChange} disabled={modalMode === 'view'} placeholder="Full name" fullWidth />
            <TextField label="Email" name="email" value={formData.email || ''} onChange={handleFormChange} disabled={modalMode === 'view'} placeholder="Email address" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role || ''} onChange={handleFormChange} disabled={modalMode === 'view'} label="Role">
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Senior Agent">Senior Agent</MenuItem>
                <MenuItem value="Team Lead">Team Lead</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status || ''} onChange={handleFormChange} disabled={modalMode === 'view'} label="Status">
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">{modalMode === 'view' ? 'Close' : 'Cancel'}</Button>
          {modalMode !== 'view' && (
            <Button onClick={handleSave} variant="contained" color="primary">{modalMode === 'create' ? 'Create Agent' : 'Save Changes'}</Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default SupportAgents;