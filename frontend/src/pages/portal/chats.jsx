import React from 'react'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: `Chats` }
];

const Chats = () => {
  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Chats"
        links={breadcrumbLinks}
        subheading="View and manage your chats here."
      />

    </React.Fragment>
  )
}

export default Chats