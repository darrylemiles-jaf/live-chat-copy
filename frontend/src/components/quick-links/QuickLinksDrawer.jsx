import { Drawer, Typography, Box, Divider, IconButton, Tooltip, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  UnorderedListOutlined,
  DashboardOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { COMPANY_URL } from '../../constants/constants';
import iconLogo from '../../assets/images/logos/icon-logo.png';


/* ── App icon tile ── */
function AppIcon({ icon, imgSrc, title, color, onClick, disabled, badge }) {
  return (
    <Tooltip title={disabled ? 'Coming soon' : ''} disableInteractive>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          px: 0.5,
          py: 1.25,
          borderRadius: 2,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.45 : 1,
          transition: 'background 0.18s ease',
          '&:hover': disabled ? {} : { bgcolor: 'action.hover' },
          '&:active': disabled ? {} : { bgcolor: 'action.selected' },
        }}
        onClick={disabled ? undefined : onClick}
      >
        <Badge
          badgeContent={badge}
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: 'error.main',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.6rem',
              minWidth: 16,
              height: 16,
              padding: '0 4px',
            },
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '22%',
              bgcolor: imgSrc ? 'transparent' : color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 22,
              flexShrink: 0,
              overflow: 'hidden',
              boxShadow: imgSrc ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
            }}
          >
            {imgSrc
              ? <Box component="img" src={imgSrc} alt={title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : icon
            }
          </Box>
        </Badge>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.72rem',
            color: 'text.primary',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 72,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Tooltip>
  );
}

const FAVORITE_APPS = [
  {
    id: 'central-admin',
    icon: <GlobalOutlined />,
    title: 'Central Admin',
    color: '#4285F4',
    path: COMPANY_URL,
  },
  {
    id: 'crm',
    icon: <TeamOutlined />,
    title: 'CRM',
    color: '#34A853',
    path: null,
    disabled: true,
  },
];

export default function QuickLinksDrawer({
  open,
  onClose,
  activeChatsCount = 0,
  pendingChatsCount = 0,
  unreadNotificationsCount = 0,
}) {
  const navigate = useNavigate();

  const quickNavItems = [
    {
      id: 'active-chats',
      icon: <MessageOutlined />,
      title: 'Active Chats',
      path: '/portal/chats',
      color: '#1A73E8',
      badge: activeChatsCount > 0 ? activeChatsCount : undefined,
    },
    {
      id: 'queue',
      icon: <UnorderedListOutlined />,
      title: 'Queue',
      path: '/portal/queue',
      color: '#EA4335',
      badge: pendingChatsCount > 0 ? pendingChatsCount : undefined,
    },
    {
      id: 'quick-chats',
      icon: <ThunderboltOutlined />,
      title: 'Quick Chats',
      path: '/portal/content-hub/quick-chats',
      color: '#F9AB00',
    },
    {
      id: 'dashboard',
      icon: <DashboardOutlined />,
      title: 'Dashboard',
      path: '/portal/dashboard',
      color: '#0F9D58',
    },
    {
      id: 'notifications',
      icon: <BellOutlined />,
      title: 'Notifications',
      path: '/portal/notifications',
      color: '#4285F4',
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: 'profile',
      icon: <SettingOutlined />,
      title: 'Profile',
      path: '/portal/profile',
      color: '#80868B',
    },
    {
      id: 'support-agents',
      icon: <TeamOutlined />,
      title: 'Support Agents',
      path: '/portal/users/supports',
      color: '#00897B',
    },
    {
      id: 'clients',
      icon: <UserOutlined />,
      title: 'Clients',
      path: '/portal/users/clients',
      color: '#7B1FA2',
    },
  ];

  const handleOpenExternal = (path) => {
    window.open(path, '_blank');
    onClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 300, exit: 220 }}
      SlideProps={{
        easing: {
          enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
      }}
      PaperProps={{
        sx: {
          width: 400,
          borderRadius: '12px 0 0 12px',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Animated content wrapper */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          animation: open ? 'timoraFadeSlide 0.28s cubic-bezier(0.4,0,0.2,1) both' : 'none',
          '@keyframes timoraFadeSlide': {
            from: { opacity: 0, transform: 'translateX(18px)' },
            to: { opacity: 1, transform: 'translateX(0)' },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 2.5,
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Quick Links
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              width: 32,
              height: 32,
              borderRadius: '50%',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            ✕
          </IconButton>
        </Box>

        <Divider />

        {/* Favorites */}
        <Box sx={{ px: 1.5, pt: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
              Favorite Apps
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {FAVORITE_APPS.map((app) => (
              <AppIcon
                key={app.id}
                {...app}
                onClick={() => handleOpenExternal(app.path)}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ mt: 2.5 }} />

        {/* Quick access */}
        <Box sx={{ px: 1.5, pt: 2.5, pb: 3, overflowY: 'auto', flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', px: 1, mb: 1.5 }}
          >
            Quick access
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {quickNavItems.map((item) => (
              <AppIcon
                key={item.id}
                {...item}
                onClick={() => handleNavigate(item.path)}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
