import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDetailsView from '../../components/UserDetailsView';
import { getCurrentUser } from '../../utils/auth';
import { customGreen, customGold } from '../../themes/palette';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleClose = () => {
    setModalOpen(false);
    navigate(-1);
  };

  const userData = {
    id: user?.id || 'N/A',
    name: user?.name || user?.username || 'N/A',
    email: user?.email || 'N/A',
    role: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A',
    phone: user?.phone || 'N/A',
    joinDate: 'N/A',
    status: 'Active'
  };

  const viewConfig = {
    avatar: {
      nameField: 'name',
      emailField: 'email'
    },
    badges: [
      {
        field: 'role',
        color: customGreen[6]
      },
      {
        field: 'status',
        color: customGold[5]
      }
    ],
    infoSections: [
      {
        title: 'Personal Information',
        fields: [
          {
            label: 'Full Name',
            field: 'name'
          },
          {
            label: 'Email Address',
            field: 'email'
          },
          {
            label: 'Phone Number',
            field: 'phone'
          },
          {
            label: 'Role',
            field: 'role'
          }
        ]
      },
      {
        title: 'Account Information',
        fields: [
          {
            label: 'User ID',
            field: 'id'
          },
          {
            label: 'Status',
            field: 'status'
          },
          {
            label: 'Join Date',
            field: 'joinDate'
          }
        ]
      }
    ]
  };

  return (
    <UserDetailsView
      open={modalOpen}
      onClose={handleClose}
      data={userData}
      viewConfig={viewConfig}
    />
  );
};

export default Profile;
