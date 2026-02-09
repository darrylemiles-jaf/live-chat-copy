import React from 'react'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'
import UnderConstruction from '../../components/maintenance/UnderConstruction';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Notifications' }
];

const Notifications = () => {
  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Notifications"
        links={breadcrumbLinks}
        subheading="View and manage your notifications here."
      />
      <UnderConstruction />

    </React.Fragment>
  )
}

export default Notifications