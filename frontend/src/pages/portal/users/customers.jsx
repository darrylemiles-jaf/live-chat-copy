import React from 'react'
import Breadcrumbs from '../../../components/@extended/Breadcrumbs'
import UnderConstruction from '../../../components/maintenance/UnderConstruction';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: `Customers` }
];

const Customers = () => {
  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Customers"
        links={breadcrumbLinks}
        subheading="View and manage your customers here."
      />
      <UnderConstruction />

    </React.Fragment>
  )
}

export default Customers