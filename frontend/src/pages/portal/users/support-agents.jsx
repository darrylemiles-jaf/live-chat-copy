import React, { useCallback, useMemo, useState } from 'react';
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
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';

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
  const [agents, setAgents] = useState([
    { id: 'AGT-1001', name: 'Amira Hassan', email: 'amira.hassan@company.com', role: 'Senior Agent', status: 'Active', successfulAssists: 124 },
    { id: 'AGT-1002', name: 'Jina Cole', email: 'jonas.cole@company.com', role: 'Agent', status: 'Active', successfulAssists: 87 },
    { id: 'AGT-1003', name: 'Priya Singh', email: 'priya.singh@company.com', role: 'Agent', status: 'Suspended', successfulAssists: 35 },
    { id: 'AGT-1004', name: 'Mason Ortiz', email: 'mason.ortiz@company.com', role: 'Team Lead', status: 'Active', successfulAssists: 210 },
    { id: 'AGT-1005', name: 'Lina Park', email: 'lina.park@company.com', role: 'Agent', status: 'Inactive', successfulAssists: 12 }
  ]);

  const handleEditClick = () => {
    setFormData(selectedAgent);
    setOpenViewModal(false);
    setOpenEditModal(true);
  };

  const handleViewById = (agent) => {
    setSelectedAgent(agent);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedAgent(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setFormData({});
  };

  const handleCreateClick = () => {
    setFormData({ id: '', name: '', email: '', role: 'Agent', status: 'Active', successfulAssists: 0 });
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
      case 'Active':
        return { label: 'Available', color: customGreen[5] };
      case 'Inactive':
        return { label: 'Away', color: customGold[5] };
      case 'Suspended':
        return { label: 'Busy', color: customRed[5] };
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
                backgroundColor: customGreen[0],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: customGreen[7],
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
      }
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
      emailField: 'email'
    },
    badges: [
      {
        field: 'role',
        color: customGreen[6]
      },
      {
        render: (data) => {
          const info = getStatusColor(data.status);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: info.color }} />
              {info.label}
            </Box>
          );
        },
        color: 'rgba(255,255,255,0.25)'
      }
    ],
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

      <UserDetailsView
        open={openViewModal}
        onClose={handleCloseViewModal}
        data={selectedAgent}
        viewConfig={viewConfig}
      />

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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
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