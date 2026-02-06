import React from 'react';
import PageTitle from '../../components/PageTitle';
import UnderConstruction from '../../components/maintenance/UnderConstruction';

const queue = () => {
  return (
    <React.Fragment>
      <PageTitle title="Queue" />
      <UnderConstruction />
    </React.Fragment>
  );
};

export default queue;
