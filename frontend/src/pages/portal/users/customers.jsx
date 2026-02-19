import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert } from '@mui/material';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';
import { useGetUsers } from '../../../api/users';
  
const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Customers' }];

const Customers = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  
  // Fetch users with role 'client' from the database
  const { users, usersLoading, usersError, usersMutate } = useGetUsers({ role: 'client' });
  
  // Update customers when users data changes
  useEffect(() => {
    if (users && users.length > 0) {
      // Transform database users to match the component's data structure
      const transformedCustomers = users.map(user => ({
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        phone: user.phone || 'N/A',
        profile_picture: user.profile_picture
      }));
      setCustomers(transformedCustomers);
    }
  }, [users]);

  const handleViewClick = (customer) => {
    setSelectedCustomer(customer);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedCustomer(null);
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

  const viewConfig = {
    avatar: {
      nameField: 'name',
      subtitleField: 'email'
    },
    infoSections: [
      {
        title: 'Personal Information',
        columns: '1fr 1fr',
        fields: [
          {
            label: 'Customer ID',
            field: 'id',
            valueStyle: { color: '#008E86' }
          },
          {
            label: 'Email',
            field: 'email'
          },
          {
            label: 'Name',
            field: 'name'
          },
          {
            label: 'Phone',
            field: 'phone'
          }
        ]
      }
    ]
  };

  // Show loading state
  if (usersLoading) {
    return (
      <React.Fragment>
        <Breadcrumbs heading="Customers" links={breadcrumbLinks} subheading="View and manage your customers here." />
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
        <Breadcrumbs heading="Customers" links={breadcrumbLinks} subheading="View and manage your customers here." />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading customers: {usersError.message || 'Please try again later.'}
        </Alert>
      </React.Fragment>
    );
  }

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

      <Dialog open={openViewModal} onClose={handleCloseViewModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#008E86', fontWeight: 700 }}>
          Customer Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <UserDetailsView
            data={selectedCustomer}
            viewConfig={viewConfig}
            styles={{
              accentColor: '#008E86',
              backgroundColor: '#E6F7F6'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewModal} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Customers;
