import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import UserDetailsView from '../../components/UserDetailsView';
import { getCurrentUser } from '../../utils/auth';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Profile' }];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // User data from JWT token
  const userData = {
    id: user?.id || 'N/A',
    name: user?.name || user?.username || 'N/A',
    email: user?.email || 'N/A',
    role: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'N/A',
    department: 'N/A',
    phone: 'N/A',
    joinDate: 'N/A',
    status: 'Active'
  };

  const viewConfig = {
    avatar: {
      nameField: 'name',
      subtitleField: 'role'
    },
    infoSections: [
      {
        title: 'Personal Information',
        columns: '1fr 1fr',
        fields: [
          {
            label: 'User ID',
            field: 'id',
            valueStyle: { color: '#008E86', fontWeight: 600 }
          },
          {
            label: 'Email',
            field: 'email'
          },
          {
            label: 'Name',
            field: 'name'
          },
          {
            label: 'Phone',
            field: 'phone'
          },
          {
            label: 'Role',
            field: 'role'
          },
          {
            label: 'Department',
            field: 'department'
          },
          {
            label: 'Join Date',
            field: 'joinDate'
          },
          {
            label: 'Status',
            field: 'status',
            valueStyle: { color: '#4caf50', fontWeight: 600 }
          }
        ]
      }
    ]
  };

  return (
    <React.Fragment>
      <Box sx={{ mb: 2 }}>
    
        <Breadcrumbs heading="My Profile" links={breadcrumbLinks} subheading="View your profile information" />
      </Box>

      <Paper sx={{ p: 3 }}>
        <UserDetailsView
          data={userData}
          viewConfig={viewConfig}
          styles={{
            accentColor: '#008E86',
            backgroundColor: '#E6F7F6'
          }}
        />
      </Paper>
    </React.Fragment>
  );
};

export default Profile;
