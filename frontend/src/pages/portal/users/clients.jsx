import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHead from '../../../components/PageHead';
import ReusableTable from '../../../components/ReusableTable';
import { useClients } from '../../../hooks/useClients';

const Clients = () => {
  const navigate = useNavigate();
  const { usersLoading, columns, rows } = useClients();

  return (
    <React.Fragment>
      <PageHead title="Clients" description="Timora Live Chat, Clients Overview" />
      <ReusableTable
        columns={columns}
        rows={rows}
        searchableColumns={['id', 'name', 'email', 'phone']}
        onRowClick={(row) => navigate(`/portal/users/details/${row.id}`)}
        isLoading={usersLoading}
        settings={{ orderBy: 'id', order: 'asc' }}
      />
    </React.Fragment>
  );
};

export default Clients;
