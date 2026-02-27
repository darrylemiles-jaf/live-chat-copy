import { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { customGreen } from '../themes/palette';
import { useGetUsers } from '../api/users';
import { transformClient } from '../utils/clients/clientTransformers';

export const useClients = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);

  const { users, usersLoading, usersError, usersMutate } = useGetUsers({ role: 'client' });

  useEffect(() => {
    if (users) {
      setCustomers(users.length > 0 ? users.map(transformClient) : []);
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
              <Typography variant="subtitle2" color="initial">{row.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
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
    avatar: { nameField: 'name', emailField: 'email' },
    badges: [{ field: 'id', color: customGreen[5] }],
    infoSections: [
      {
        title: 'Personal Information',
        columns: '1fr 1fr',
        fields: [
          { label: 'Customer ID', field: 'id', valueStyle: { color: customGreen[5] } },
          { label: 'Email', field: 'email' },
          { label: 'Name', field: 'name' },
          { label: 'Phone', field: 'phone', defaultValue: 'N/A' }
        ]
      }
    ]
  };

  return {
    openViewModal,
    selectedCustomer,
    customers,
    usersLoading,
    usersError,
    usersMutate,
    columns,
    rows,
    viewConfig,
    handleViewClick,
    handleCloseViewModal
  };
};
