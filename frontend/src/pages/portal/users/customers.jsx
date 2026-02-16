import React, { useMemo, useState } from 'react';
import { Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';
  
const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Customers' }];

const Customers = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: ''
  });

  const [customers, setCustomers] = useState([
    {
      id: 'CUST-1001',
      name: 'Sarah Williams',
      email: 'sarah.williams@techcorp.com',
      phone: '+63 (555) 123-4567'
    },
    {
      id: 'CUST-1002',
      name: 'Michael Chen',
      email: 'michael.chen@innovate.io',
      phone: '+63 (555) 234-5678'
    },
    {
      id: 'CUST-1003',
      name: 'Emma Rodriguez',
      email: 'emma.r@globalventures.com',
      phone: '+63 (555) 345-6789'
    },
    {
      id: 'CUST-1004',
      name: 'James Thompson',
      email: 'j.thompson@startup.co',
      phone: '+63 (555) 456-7890'
    },
    {
      id: 'CUST-1005',
      name: 'Olivia Martinez',
      email: 'olivia@enterprise.com',
      phone: '+63 (555) 567-8901'
    },
    {
      id: 'CUST-1006',
      name: 'David Kim',
      email: 'david.kim@digital.net',
      phone: '+63 (555) 678-9012'
    }
  ]);

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleViewClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCustomer(null);
    setFormData({});
    setModalMode('view');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Update existing customer
    setCustomers(customers.map((customer) => (customer.id === formData.id ? formData : customer)));
    console.log('Updating customer:', formData);
    handleCloseModal();
  };

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
                backgroundColor: '#E6F7F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#008E86',
                fontSize: '16px'
              }}
            >
              {row.name ? row.name.charAt(0).toUpperCase() : '-'}
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                ID: {row.id}
              </Typography>
              <Typography variant="subtitle2" color="initial">
                {row.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      },
      { id: 'phone', label: 'Phone', minWidth: 150, align: 'left' }
    ],
    []
  );

  const rows = useMemo(() => customers, [customers]);

  return (
    <React.Fragment>
      <Breadcrumbs heading="Customers" links={breadcrumbLinks} subheading="View and manage your customers here." />
      <ReusableTable
        columns={columns}
        rows={rows}
        searchableColumns={['id', 'name', 'email', 'phone']}
        onRowClick={handleViewClick}
        settings={{
          orderBy: 'id',
          order: 'asc'
        }}
      />

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modalMode === 'edit' ? 'Update Customer' : 'Customer Details'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Customer ID" value={formData.id || ''} placeholder="CUST-0000" disabled fullWidth />
            <TextField
              label="Name"
              name="name"
              value={formData.name || ''}
              onChange={handleFormChange}
              disabled={modalMode === 'view'}
              placeholder="Full name"
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email || ''}
              onChange={handleFormChange}
              disabled={modalMode === 'view'}
              placeholder="Email address"
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleFormChange}
              disabled={modalMode === 'view'}
              placeholder="+63 (555) 123-4567"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            {modalMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {modalMode !== 'view' && (
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Customers;
