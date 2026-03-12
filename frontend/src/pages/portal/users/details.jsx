import React from 'react'
import UserDetailsPage from '../../../sections/users/UserDetailsPage'
import { useLocation, useParams } from 'react-router-dom'

const UserDetails = () => {
  const location = useLocation()
  const { id } = useParams(location.pathname)
  return (
    <UserDetailsPage userId={id} />
  )
}

export default UserDetails