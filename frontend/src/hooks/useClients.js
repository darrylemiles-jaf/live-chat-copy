import { useState, useEffect } from 'react';
import { useGetUsers } from '../api/users';
import { transformClient } from '../utils/clients/clientTransformers';
import { clientColumns, clientViewConfig } from '../utils/clients/clientTableConfig';

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

  const columns = clientColumns;
  const rows = customers;
  const viewConfig = clientViewConfig;

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
