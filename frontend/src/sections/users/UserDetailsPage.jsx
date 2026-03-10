import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  IconButton,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import Users from 'api/users';
import { getAgentRatings } from 'api/ratingsApi';
import AgentRatingsTab from 'components/AgentRatingsTab';
import { getStatusColor } from 'utils/agents/agentTransformers';

const UserDetailsPage = ({ userId = '' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const accentColor = theme.vars.palette.primary.main;
  const accentColorDark = theme.vars.palette.primary.dark;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    Users.getSingleUser(userId)
      .then((res) => {
        const raw = res?.data;
        if (!raw) { setError('User not found.'); return; }
        const u = {
          id: raw.id,
          name: raw.name || raw.username || 'N/A',
          email: raw.email || 'N/A',
          phone: raw.phone || 'N/A',
          role: raw.role ? raw.role.charAt(0).toUpperCase() + raw.role.slice(1) : 'N/A',
          status: raw.status ? raw.status.charAt(0).toUpperCase() + raw.status.slice(1) : 'Active',
          rawRole: raw.role
        };
        setUser(u);
        if (raw.role === 'support' || raw.role === 'admin') {
          setLoadingRatings(true);
          getAgentRatings(raw.id)
            .then((r) => { if (r) setRatingData(r); })
            .catch(() => { })
            .finally(() => setLoadingRatings(false));
        }
      })
      .catch((err) => setError(err.message || 'Failed to load user.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const getInitials = (name) => {
    if (!name || name === 'N/A') return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error || 'User not found.'}</Alert>;
  }

  const isAgent = user.rawRole === 'support' || user.rawRole === 'admin';
  const avg = parseFloat(ratingData?.stats?.average_rating) || 0;
  const statusInfo = isAgent ? getStatusColor(user.status) : null;

  const infoSections = isAgent
    ? [
      {
        title: 'Personal Information',
        fields: [
          { label: 'Full Name', value: user.name },
          { label: 'Email Address', value: user.email },
          { label: 'Phone Number', value: user.phone },
          { label: 'Role', value: user.role }
        ]
      },
      {
        title: 'Account Information',
        fields: [
          { label: 'Member ID', value: user.id },
          { label: 'Status', value: user.status, statusDot: statusInfo?.color }
        ]
      }
    ]
    : [
      {
        title: 'Personal Information',
        fields: [
          { label: 'Client ID', value: user.id },
          { label: 'Full Name', value: user.name },
          { label: 'Email Address', value: user.email },
          { label: 'Phone Number', value: user.phone }
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
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            left: { xs: 8, sm: 16 },
            top: { xs: 8, sm: 16 },
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)', transform: 'scale(1.05)' },
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeftOutlined style={{ fontSize: '1.25rem' }} />
        </IconButton>

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
          {user.name !== 'N/A' ? getInitials(user.name) : <UserOutlined style={{ fontSize: '2.5rem' }} />}
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {user.name}
        </Typography>

        {user.email !== 'N/A' && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: { xs: 1.5, sm: 2 }, opacity: 0.95 }}>
            <Box component="span" sx={{ fontSize: '0.875rem' }}>✉</Box>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {user.email}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={user.role}
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
          {isAgent && (
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusInfo?.color }} />
                  {user.status}
                </Box>
              }
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                height: { xs: '26px', sm: '28px' },
                px: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          )}
          {isAgent && avg > 0 && (
            <Chip
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Box component="span" sx={{ color: 'var(--palette-warning-main)', fontSize: '0.85rem' }}>&#9733;</Box>
                  <Box component="span" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{avg.toFixed(1)}</Box>
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
                    {field.statusDot ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: field.statusDot }} />
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
                    ) : (
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
                    )}
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

export default UserDetailsPage;