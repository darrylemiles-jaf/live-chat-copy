import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import UserDetailsView from '../../components/UserDetailsView';

const breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Profile' }];

const Profile = () => {
  const navigate = useNavigate();

  // Mock user data - replace with actual user data from context/auth
  const userData = {
    id: 'USR-1001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'UI/UX Designer',
    department: 'Design',
    phone: '+63 (555) 123-4567',
    joinDate: 'January 15, 2024',
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
