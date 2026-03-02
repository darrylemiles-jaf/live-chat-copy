import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  UnorderedListOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';

export default function QuickLinksDialog({
  open,
  onClose,
  activeChatsCount = 0,
  pendingChatsCount = 0,
  unreadNotificationsCount = 0
}) {
  const navigate = useNavigate();

  const quickActionGroups = [
    {
      name: 'Primary Actions',
      items: [
        {
          id: 'active-chats',
          icon: <MessageOutlined />,
          title: 'Active Chats',
          description: 'View and manage your active conversations',
          path: '/portal/chats',
          badge: activeChatsCount,
          color: '#008E86',
          highlight: activeChatsCount > 0
        },
        {
          id: 'queue',
          icon: <UnorderedListOutlined />,
          title: 'Queue',
          description: 'Check chats waiting for assignment',
          path: '/portal/queue',
          badge: pendingChatsCount,
          color: '#B53654',
          highlight: pendingChatsCount > 0
        }
      ]
    },
    {
      name: 'Navigation',
      items: [
        {
          id: 'dashboard',
          icon: <DashboardOutlined />,
          title: 'Dashboard',
          description: 'View analytics and performance metrics',
          path: '/portal/dashboard',
          color: '#008E86',
          highlight: false
        },
        {
          id: 'notifications',
          icon: <BellOutlined />,
          title: 'Notifications',
          description: 'View your latest notifications',
          path: '/portal/notifications',
          badge: unreadNotificationsCount,
          color: '#0066CC',
          highlight: unreadNotificationsCount > 0
        },
        {
          id: 'profile',
          icon: <SettingOutlined />,
          title: 'Profile',
          description: 'Manage your account and preferences',
          path: '/portal/profile',
          color: '#556270',
          highlight: false
        }
      ]
    },
    {
      name: 'Management',
      items: [
        {
          id: 'support-agents',
          icon: <TeamOutlined />,
          title: 'Support Agents',
          description: 'View all support team members',
          path: '/portal/users/supports',
          color: '#2E7D32',
          highlight: false
        },
        {
          id: 'clients',
          icon: <UserOutlined />,
          title: 'Clients',
          description: 'Browse and manage all clients',
          path: '/portal/users/clients',
          color: '#6C4C93',
          highlight: false
        }
      ]
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#064856', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Quick Actions
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Jump to important tasks and information
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
          {quickActionGroups.map((group) => (
            <Box key={group.name}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: '#064856',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 1.5,
                  pl: 0.5
                }}
              >
                {group.name}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: { xs: 1, sm: 1.5, md: 2 }
                }}
              >
                {group.items.map((action) => (
                  <Paper
                    key={action.id}
                    elevation={0}
                    onClick={() => handleNavigate(action.path)}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: action.highlight ? action.color : '#E0E0E0',
                      borderRadius: 2,
                      transition: 'all 0.25s ease',
                      background: action.highlight ? `rgba(${parseInt(action.color.slice(1, 3), 16)}, ${parseInt(action.color.slice(3, 5), 16)}, ${parseInt(action.color.slice(5, 7), 16)}, 0.04)` : 'transparent',
                      minHeight: '140px',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, ${action.color}, transparent)`,
                        opacity: action.highlight ? 1 : 0
                      },
                      '&:hover': {
                        borderColor: action.color,
                        bgcolor: action.highlight
                          ? `rgba(${parseInt(action.color.slice(1, 3), 16)}, ${parseInt(action.color.slice(3, 5), 16)}, ${parseInt(action.color.slice(5, 7), 16)}, 0.08)`
                          : 'rgba(0, 142, 134, 0.08)',
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 24px rgba(${parseInt(action.color.slice(1, 3), 16)}, ${parseInt(action.color.slice(3, 5), 16)}, ${parseInt(action.color.slice(5, 7), 16)}, 0.15)`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                      <Box sx={{ fontSize: { xs: '28px', sm: '32px' }, color: action.color, flex: 1 }}>
                        {action.icon}
                      </Box>
                      {action.badge !== undefined && action.badge > 0 && (
                        <Badge
                          badgeContent={action.badge}
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: action.color,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem'
                            }
                          }}
                        >
                          <Box />
                        </Badge>
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: '#064856',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          mb: 0.5
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          lineHeight: 1.4
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>

                    {action.highlight && (
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          mt: 1,
                          height: '20px',
                          backgroundColor: action.color,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.65rem'
                        }}
                      />
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 1.5 } }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            minWidth: { xs: '100%', sm: 80 },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            borderColor: '#008E86',
            color: '#008E86',
            '&:hover': {
              borderColor: '#064856',
              bgcolor: 'rgba(6, 72, 86, 0.04)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
