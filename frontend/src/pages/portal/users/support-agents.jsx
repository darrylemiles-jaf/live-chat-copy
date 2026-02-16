import React, { useCallback, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { customGreen } from "../../../themes/palette";
import { customGold } from "../../../themes/palette";
import { customRed } from "../../../themes/palette";
import {  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';
import ViewModal from '../../../components/ViewModal';
import EditModal from '../../../components/EditModal';

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
    // Update existing agent
    setAgents(agents.map((agent) => (agent.id === formData.id ? formData : agent)));
    console.log('Updating agent:', formData);
    handleCloseEditModal();
  };

  const handleCreate = () => {
    // Generate new agent ID
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
    () => agents,
    [agents]
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

  const editModalFields = [
    { name: 'id', label: 'Agent ID', disabled: true, placeholder: 'AGT-0000' },
    { name: 'name', label: 'Name', placeholder: 'Full name' },
    { name: 'email', label: 'Email', placeholder: 'Email address' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'Agent', label: 'Agent' },
        { value: 'Senior Agent', label: 'Senior Agent' },
        { value: 'Team Lead', label: 'Team Lead' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' }
      ]
    }
  ];

  const createModalFields = [
    { name: 'name', label: 'Name', placeholder: 'Full name' },
    { name: 'email', label: 'Email', placeholder: 'Email address' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'Agent', label: 'Agent' },
        { value: 'Senior Agent', label: 'Senior Agent' },
        { value: 'Team Lead', label: 'Team Lead' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' }
      ]
    }
  ];

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
                Add Agent
              </Button>
            </Box>
          )
        }}
      />

      <ViewModal
        open={openViewModal}
        onClose={handleCloseViewModal}
        onEdit={handleEditClick}
        title="Agent Details"
        data={selectedAgent}
        viewConfig={viewConfig}
        styles={{
          titleColor: customGreen[5],
          accentColor: customGreen[5],
          backgroundColor: '#e8f5e9'
        }}
      />

      <EditModal
        open={openEditModal}
        onClose={handleCloseEditModal}
        title="Update Agent"
        data={formData}
        onChange={handleFormChange}
        onSave={handleSave}
        fields={editModalFields}
      />

      <EditModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        title="Create Agent"
        data={formData}
        onChange={handleFormChange}
        onSave={handleCreate}
        fields={createModalFields}
        saveButtonText="Create Agent"
      />
    </React.Fragment>
  );
};

export default SupportAgents;