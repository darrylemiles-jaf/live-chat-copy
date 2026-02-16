import React, { useMemo, useState } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';
  
const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Customers' }];

const Customers = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
