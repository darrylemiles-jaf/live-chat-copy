import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// utils
import { logout, getCurrentUser } from 'utils/auth';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import UserDetailsView from 'components/UserDetailsView';

import { customGreen, customGold } from 'themes/palette';


import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleViewProfile = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
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
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton>
          <ListItemIcon>
          </ListItemIcon>
        </ListItemButton>
        <ListItemButton onClick={handleViewProfile}>
          <ListItemIcon>
            <UserOutlined />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </ListItemButton>

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      <UserDetailsView
        open={modalOpen}
        onClose={handleCloseModal}
        data={userData}
        viewConfig={viewConfig}
      />
    </>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
