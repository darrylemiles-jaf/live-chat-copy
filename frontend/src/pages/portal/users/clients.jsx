import React from 'react';
import PageHead from '../../../components/PageHead';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';
import { useClients } from '../../../hooks/useClients';

const Clients = () => {
  const {
    openViewModal,
    selectedCustomer,
    usersLoading,
    columns,
    rows,
    viewConfig,
    handleViewClick,
    handleCloseViewModal
  } = useClients();

  return (
    <React.Fragment>
      <PageHead title="Clients" description="Timora Live Chat, Clients Overview" />
      <ReusableTable
        columns={columns}
        rows={rows}
        searchableColumns={['id', 'name', 'email', 'phone']}
        onRowClick={handleViewClick}
        isLoading={usersLoading}
        settings={{ orderBy: 'id', order: 'asc' }}
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
