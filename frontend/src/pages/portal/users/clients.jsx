import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { customGreen } from '../../../themes/palette';
import { useGetUsers } from '../../../api/users';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import PageHead from '../../../components/PageHead';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';
  
const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Clients' }];

const Clients = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);

  const { users, usersLoading, usersError, usersMutate } = useGetUsers({ role: 'client' });

  
  useEffect(() => {
    console.log('Users from API:', users);
    if (users) {
      if (users.length > 0) {
        users.forEach(user => {
          console.log('User phone from DB:', user.id, user.phone, typeof user.phone);
        });
        const transformedCustomers = users.map(user => ({
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          phone: user.phone || 'N/A',
          profile_picture: user.profile_picture,
          role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Client',
          status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'
        }));
        console.log('Transformed customers:', transformedCustomers);
        transformedCustomers.forEach(cust => {
          console.log('Customer phone after transform:', cust.id, cust.phone);
        });
        setCustomers(transformedCustomers);
      } else {
        setCustomers([]);
      }
    }
  }, [users]);

  const handleViewClick = (customer) => {
    console.log('Selected customer data:', customer);
    console.log('Customer phone value:', customer.phone, typeof customer.phone);
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
                backgroundColor: customGreen[0],
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
      emailField: 'email'
    },
    badges: [
      {
        field: 'id',
        color: customGreen[5]
      }
    ],
    infoSections: [
      {
        title: 'Personal Information',
        columns: '1fr 1fr',
        fields: [
          {
            label: 'Customer ID',
            field: 'id',
            valueStyle: { color: customGreen[5] }
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
            field: 'phone',
            defaultValue: 'N/A'
          }
        ]
      }
    ]
  };

  return (
    <React.Fragment>
      <PageHead title='Clients' description='Timora Live Chat, Clients Overview' />
      <Breadcrumbs heading="Clients" links={breadcrumbLinks} subheading="View and manage your clients here." />
      
      <ReusableTable
        columns={columns}
        rows={rows}
        searchableColumns={['id', 'name', 'email', 'phone']}
        onRowClick={handleViewClick}
        isLoading={usersLoading}
        settings={{
          orderBy: 'id',
          order: 'asc'
        }}
      />

      <UserDetailsView
        open={openViewModal}
        onClose={handleCloseViewModal}
        data={selectedCustomer}
        viewConfig={viewConfig}
      />
    </React.Fragment>
  );
};

export default Clients;
