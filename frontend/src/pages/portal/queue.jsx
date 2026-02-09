import React from 'react'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'
import UnderConstruction from '../../components/maintenance/UnderConstruction';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Queue' }
];

const Queue = () => {
  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Queue"
        links={breadcrumbLinks}
        subheading="View and manage your chat queue here."
      />
      <UnderConstruction />

    </React.Fragment>
  )
}

export default Queue