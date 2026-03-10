import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button, FormControl, InputLabel, Select, MenuItem, DialogActions, DialogContent, DialogTitle, Dialog, TextField } from '@mui/material';

import PageHead from '../../../components/PageHead';
import ReusableTable from '../../../components/ReusableTable';
import AgentEditDialog from '../../../sections/agents/AgentEditDialog';
import AgentCreateDialog from '../../../sections/agents/AgentCreateDialog';
import { useSupportAgents } from '../../../hooks/useSupportAgents';
import { PlusOutlined } from '@ant-design/icons';



const SupportAgents = () => {
  const navigate = useNavigate();
  const {
    openEditModal, openCreateModal,
    formData,
    filterRole, filterStatus,
    usersLoading, usersError,
    filteredRowsForTable, uniqueRoles, columns,
    handleCloseEditModal, handleCreateClick, handleCloseCreateModal,
    handleFormChange, handleSave, handleCreate,
    setFilterRole, setFilterStatus,
  } = useSupportAgents();





  if (usersLoading) {
    return (
      <React.Fragment>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </React.Fragment>
    );
  }

  if (usersError) {
    return (
      <React.Fragment>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading support agents: {usersError.message || 'Please try again later.'}
        </Alert>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <PageHead title='Support Agents' description='Timora Live Chat, Support Agents Overview' />
      <ReusableTable
        columns={columns}
        rows={filteredRowsForTable}
        searchableColumns={['id', 'name', 'email', 'role', 'status']}
        onRowClick={(row) => navigate(`/portal/users/details/${row.id}`)}
        settings={{
          orderBy: '__originalOrder',
          order: 'asc',
          otherActionButton: (
            <Box sx={{
              display: 'flex',
              gap: 1,
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                <InputLabel>Role</InputLabel>
                <Select value={filterRole} label="Role" onChange={(e) => setFilterRole(e.target.value)}>
                  <MenuItem value="">All Roles</MenuItem>
                  {uniqueRoles.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Busy">Busy</MenuItem>
                  <MenuItem value="Away">Away</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => { setFilterRole(''); setFilterStatus(''); }}
                sx={{ width: { xs: '100%', sm: 'auto' }, color: 'text.primary', borderColor: 'divider' }}
                size='small'
              >
                Clear
              </Button>
            </Box>
          )
        }}
      />

      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: `warning.main`, fontWeight: 700 }}>Update Agent</DialogTitle>
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
              bgcolor: 'warning.main',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: `warning.dark` }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreateModal} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'warning.main', fontWeight: 700 }}>Create New Agent</DialogTitle>
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
              bgcolor: 'warning.main',
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: 'warning.main' }
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