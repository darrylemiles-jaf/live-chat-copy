import React from 'react';
import Breadcrumbs from '../../../components/@extended/Breadcrumbs';
import PageHead from '../../../components/PageHead';
import ReusableTable from '../../../components/ReusableTable';
import UserDetailsView from '../../../components/UserDetailsView';
import { useClients } from '../../../hooks/useClients';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Clients' }];

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
      <Breadcrumbs heading="Clients" links={breadcrumbLinks} subheading="View and manage your clients here." />

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
