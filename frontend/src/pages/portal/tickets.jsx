import React from 'react'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'
import UnderConstruction from '../../components/maintenance/UnderConstruction';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Tickets' }
];

const Tickets = () => {
  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Tickets"
        links={breadcrumbLinks}
        subheading="View and manage your tickets here."
      />
      <UnderConstruction />

    </React.Fragment>
  )
}

export default Tickets