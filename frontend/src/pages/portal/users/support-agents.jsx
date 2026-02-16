import React, { useCallback, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { customGreen } from "../../../themes/palette";
import { customGold } from "../../../themes/palette";
import { customRed } from "../../../themes/palette";
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
  Chip,
  Avatar
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
  const [formData, setFormData] = useState({ id: '', name: '', email: '', role: '', status: '', successfulAssists: 0 });

  const handleEditClick = (agent) => {
    setSelectedAgent(agent);
    setFormData(agent);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleViewById = (agent) => {
    setSelectedAgent(agent);
    setFormData(agent);
    setModalMode('view');
    setOpenModal(true);
  };

  const theme = useTheme();

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
        return { label: 'Available', color: customGreen[3] };
      case 'Inactive':
        return { label: 'Away', color: customGold[3] };
      case 'Suspended':
        return { label: 'Busy', color: customRed[3] };
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
                color: customGreen[5],
                fontSize: '16px'
              }}
            >
              {row.name ? row.name.charAt(0).toUpperCase() : '-'}
            </Box>
            <Box>
              <Typography
                noWrap
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { color: customGreen[5], textDecoration: 'underline' },
                  display: 'block',
                  mb: 0.5
                }}
                onClick={() => handleViewById(row)}
              >
                ID: {row.id}
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
    () => [
      { id: 'AGT-1001', name: 'Amira Hassan', email: 'amira.hassan@company.com', role: 'Senior Agent', status: 'Active', successfulAssists: 124 },
      { id: 'AGT-1002', name: 'Jina Cole', email: 'jonas.cole@company.com', role: 'Agent', status: 'Active', successfulAssists: 87 },
      { id: 'AGT-1003', name: 'Priya Singh', email: 'priya.singh@company.com', role: 'Agent', status: 'Suspended', successfulAssists: 35 },
      { id: 'AGT-1004', name: 'Mason Ortiz', email: 'mason.ortiz@company.com', role: 'Team Lead', status: 'Active', successfulAssists: 210 },
      { id: 'AGT-1005', name: 'Lina Park', email: 'lina.park@company.com', role: 'Agent', status: 'Inactive', successfulAssists: 12 }
    ],
    []
  );

  // Filter state
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const uniqueRoles = useMemo(() => Array.from(new Set((rows || []).map((r) => r.role))).sort(), [rows]);

  const mapStatusLabel = (rowStatus) => getStatusColor(rowStatus).label;

  const filteredRowsForTable = useMemo(() => {
    const filtered = (rows || []).filter((r) => {
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

  const modalStatusInfo = useMemo(() => getStatusColor(formData.status), [formData.status, getStatusColor]);

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
        <DialogTitle sx={modalMode === 'view' ? { color: customGreen[5], fontWeight: 700 } : {}}>{modalMode === 'create' ? 'Create Agent' : modalMode === 'edit' ? 'Update Agent' : 'View Agent'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {modalMode === 'view' ? (
            <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'flex-start' }}>
              <Box sx={{ width: 240, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 1, bgcolor: '#e8f5e9', color: customGreen[5], fontWeight: 700 }}>{(formData.name || '?').split(' ').map(n=>n[0]).slice(0,2).join('')}</Avatar>
                <Typography variant="h6" sx={{ mt: 1 }}>{formData.name || '-'}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{formData.role || '-'}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ p: 1.25, borderRadius: 1, border: '1px solid', borderColor: 'divider', minWidth: 180, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: customGreen[5], fontWeight: 700, lineHeight: 1 }}>{formData.successfulAssists ?? 0}</Typography>
                    <Typography variant="caption" color="text.secondary">Successful assists</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: customGreen[5], fontWeight: 700 }}>Personal Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Member ID</Typography>
                    <Typography variant="body2" sx={{ color: customGreen[5] }}>{formData.id || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{formData.email || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Role</Typography>
                    <Typography variant="body2">{formData.role || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: modalStatusInfo.color }} />
                      <Typography variant="body2" sx={{ color: customGreen[5] }}>{mapStatusLabel(formData.status)}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
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
          )}
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