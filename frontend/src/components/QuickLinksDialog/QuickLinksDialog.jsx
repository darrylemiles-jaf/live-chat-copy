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
import { useTheme } from '@mui/material/styles';
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
} from '@ant-design/icons';

export default function QuickLinksDialog({
  open,
  onClose,
  activeChatsCount = 0,
  pendingChatsCount = 0,
  unreadNotificationsCount = 0
}) {
  const navigate = useNavigate();
  const theme = useTheme();

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
          color: theme.vars.palette.primary.main,
          highlight: activeChatsCount > 0
        },
        {
          id: 'queue',
          icon: <UnorderedListOutlined />,
          title: 'Queue',
          description: 'Check chats waiting for assignment',
          path: '/portal/queue',
          badge: pendingChatsCount,
          color: theme.vars.palette.error.main,
          highlight: pendingChatsCount > 0
        },
        {
          id: 'quick-chats',
          icon: <ThunderboltOutlined />,
          title: 'Quick Chats',
          description: 'Use saved quick reply templates',
          path: '/portal/content-hub/quick-chats',
          color: theme.vars.palette.warning.main,
          highlight: false
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
          color: theme.vars.palette.primary.main,
          highlight: false
        },
        {
          id: 'notifications',
          icon: <BellOutlined />,
          title: 'Notifications',
          description: 'View your latest notifications',
          path: '/portal/notifications',
          badge: unreadNotificationsCount,
          color: theme.vars.palette.info.main,
          highlight: unreadNotificationsCount > 0
        },
        {
          id: 'profile',
          icon: <SettingOutlined />,
          title: 'Profile',
          description: 'Manage your account and preferences',
          path: '/portal/profile',
          color: theme.vars.palette.text.secondary,
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
          color: theme.vars.palette.success.dark,
          highlight: false
        },
        {
          id: 'clients',
          icon: <UserOutlined />,
          title: 'Clients',
          description: 'Browse and manage all clients',
          path: '/portal/users/clients',
          color: theme.vars.palette.secondary.main,
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
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
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
                  color: 'primary.dark',
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
                      borderColor: action.highlight ? action.color : 'divider',
                      borderRadius: 2,
                      transition: 'all 0.25s ease',
                      background: action.highlight
                        ? `color-mix(in srgb, ${action.color} 10%, transparent)`
                        : 'transparent',
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
                        bgcolor: `color-mix(in srgb, ${action.color} 12%, transparent)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 24px color-mix(in srgb, ${action.color} 20%, transparent)`
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
                          color: 'text.primary',
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
          color="primary"
          sx={{
            minWidth: { xs: '100%', sm: 80 },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.8rem', sm: '0.85rem' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
