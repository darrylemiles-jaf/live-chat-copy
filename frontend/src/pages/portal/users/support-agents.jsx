import React from 'react'
import Breadcrumbs from '../../../components/@extended/Breadcrumbs'
import UnderConstruction from '../../../components/maintenance/UnderConstruction';

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: `Support Agents` }
];

const SupportAgents = () => {
  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Support Agents"
        links={breadcrumbLinks}
        subheading="View and manage your support agents here."
      />
      <UnderConstruction />

    </React.Fragment>
  )
}

export default SupportAgents