import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import UserDetailsView from '../../components/UserDetailsView';
import AgentRatingsTab from '../../components/AgentRatingsTab';
import { getCurrentUser } from '../../utils/auth';
import { customGreen, customGold } from '../../themes/palette';
import { getAgentRatings } from '../../api/ratingsApi';

/* ── Main page ──────────────────────────────────────────────────── */
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);
  const [ratingData, setRatingData] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser?.role === 'support' || currentUser?.role === 'admin') {
      setLoadingRatings(true);
      getAgentRatings(currentUser.id)
        .then((res) => { if (res.success !== false) setRatingData(res); })
        .catch(() => { })
        .finally(() => setLoadingRatings(false));
    }
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

  const isAgent = user?.role === 'support' || user?.role === 'admin';
  const avgRating = parseFloat(ratingData?.stats?.average_rating) || 0;

  const viewConfig = {
    avatar: { nameField: 'name', emailField: 'email' },
    badges: [
      { field: 'role', color: customGreen[6] },
      { field: 'status', color: customGold[5] },
      ...(isAgent && avgRating > 0
        ? [{
          render: () => (
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Box component="span" sx={{ color: '#fbbf24', fontSize: '0.85rem' }}>&#9733;</Box>
              <Box component="span" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                {avgRating.toFixed(1)}
              </Box>
            </Box>
          ),
          sx: { bgcolor: '#92400e', color: 'white' }
        }]
        : [])
    ],
    infoSections: [
      {
        title: 'Personal Information',
        fields: [
          { label: 'Full Name', field: 'name' },
          { label: 'Email Address', field: 'email' },
          { label: 'Phone Number', field: 'phone' },
          { label: 'Role', field: 'role' }
        ]
      },
      {
        title: 'Account Information',
        fields: [
          { label: 'User ID', field: 'id' },
          { label: 'Status', field: 'status' },
          { label: 'Join Date', field: 'joinDate' }
        ]
      }
    ],
    ...(isAgent
      ? {
        tabs: [
          {
            label: 'Satisfaction Ratings',
            content: () => <AgentRatingsTab ratingData={ratingData} loading={loadingRatings} />
          }
        ]
      }
      : {})
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
