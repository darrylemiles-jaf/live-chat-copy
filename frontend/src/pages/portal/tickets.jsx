import React from 'react';
import PageTitle from '../../components/PageTitle';
import UnderConstruction from '../../components/maintenance/UnderConstruction';

const tickets = () => {
  return (
    <React.Fragment>
      <PageTitle title="Tickets" />
      <UnderConstruction />
    </React.Fragment>
  );
};

export default tickets;
