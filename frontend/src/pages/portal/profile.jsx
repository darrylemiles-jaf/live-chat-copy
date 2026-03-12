import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { UserOutlined } from '@ant-design/icons';
import AgentRatingsTab from '../../components/AgentRatingsTab';
import { getCurrentUser } from '../../utils/auth';
import { getAgentRatings } from '../../api/ratingsApi';

/* ── Main page ──────────────────────────────────────────────────── */
const Profile = () => {
  const theme = useTheme();
  const accentColor = theme.vars.palette.primary.main;
  const accentColorDark = theme.vars.palette.primary.dark;
  const [user, setUser] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [tabValue, setTabValue] = useState(0);

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

  const userData = {
    id: user?.id || 'N/A',
    name: user?.name || user?.username || 'N/A',
    email: user?.email || 'N/A',
    role: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A',
    phone: user?.phone || 'N/A',
    status: 'Active'
  };

  const isAgent = user?.role === 'support' || user?.role === 'admin';
  const avgRating = parseFloat(ratingData?.stats?.average_rating) || 0;

  const getInitials = (name) => {
    if (!name || name === 'N/A') return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const infoSections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: userData.name },
        { label: 'Email Address', value: userData.email },
        { label: 'Phone Number', value: userData.phone },
        { label: 'Role', value: userData.role }
      ]
    },
    {
      title: 'Account Information',
      fields: [
        { label: 'User ID', value: userData.id },
        { label: 'Status', value: userData.status }
      ]
    }
  ];

  return (
    <Box>
      {/* Gradient header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColorDark} 100%)`,
          color: 'white',
          pt: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 4 },
          position: 'relative',
          textAlign: 'center'
        }}
      >
        <Avatar
          sx={{
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            mx: 'auto',
            mb: { xs: 1.5, sm: 2 },
            bgcolor: 'white',
            color: accentColor,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '4px solid rgba(255,255,255,0.3)'
          }}
        >
          {userData.name !== 'N/A' ? getInitials(userData.name) : <UserOutlined style={{ fontSize: '2.5rem' }} />}
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {userData.name}
        </Typography>

        {userData.email !== 'N/A' && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: { xs: 1.5, sm: 2 }, opacity: 0.95 }}>
            <Box component="span" sx={{ fontSize: '0.875rem' }}>✉</Box>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {userData.email}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={userData.role}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              height: { xs: '26px', sm: '28px' },
              px: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Chip
            label={userData.status}
            size="small"
            sx={{
              bgcolor: 'var(--palette-warning-main)',
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              height: { xs: '26px', sm: '28px' },
              px: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          {isAgent && avgRating > 0 && (
            <Chip
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Box component="span" sx={{ color: 'var(--palette-warning-main)', fontSize: '0.85rem' }}>&#9733;</Box>
                  <Box component="span" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{avgRating.toFixed(1)}</Box>
                </Box>
              }
              size="small"
              sx={{
                bgcolor: 'var(--palette-warning-darker)',
                color: 'white',
                fontWeight: 600,
                height: { xs: '26px', sm: '28px' },
                px: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          )}
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 } }}>
          {infoSections.map((section, sectionIndex) => (
            <Box key={sectionIndex} sx={{ flex: 1 }}>
              {section.title && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: { xs: 2, sm: 2.5 },
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                {section.fields.map((field, fieldIndex) => (
                  <Box key={fieldIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.vars.palette.text.disabled,
                        fontWeight: 400,
                        fontSize: '0.75rem',
                        letterSpacing: '0.3px',
                        lineHeight: 1.2
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: theme.vars.palette.text.primary,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        lineHeight: 1.5
                      }}
                    >
                      {field.value || '-'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {isAgent && (
          <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                },
                '& .Mui-selected': { color: accentColor },
                '& .MuiTabs-indicator': { backgroundColor: accentColor }
              }}
            >
              <Tab label="Satisfaction Ratings" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
              <AgentRatingsTab ratingData={ratingData} loading={loadingRatings} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
