// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import { mutate } from 'swr';

// project import
import Profile from './Profile';
import MobileSection from './MobileSection';
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Link,
  Grid,
  Paper,
  Divider,
  Drawer,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'utils/auth';
import Users from 'api/users';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  BellOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('available');
  const [statusLoading, setStatusLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser?.id) return setUser(currentUser);

      try {
        const res = await Users.getSingleUser(currentUser.id);
        if (res?.success && res.data) {
          setUser(res.data);
          setStatus(res.data.status || 'available');
          try {
            localStorage.setItem('user', JSON.stringify(res.data));
          } catch (e) {
            /* ignore storage errors */
          }
          return;
        }
      } catch (e) {
        console.error('Failed to fetch user from API:', e.message);
      }

      // fallback to token payload
      setUser(currentUser);
    };

    loadUser();
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleToggleStatus = async (newStatus) => {
    if (!user?.id || statusLoading || newStatus === status) return;
    setStatusLoading(true);
    try {
      const response = await Users.updateUserStatus(user.id, newStatus);
      if (response?.success) {
        setStatus(newStatus);
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...parsed, status: newStatus }));
        }
        mutate((key) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/users'));
      }
    } catch (e) {
      console.error('Failed to update status:', e.message);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button onClick={handleOpenModal} sx={{ color: 'text.primary' }}>
          Quick Links
        </Button>
        <Button component="a" href="https://timora.ph/" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary' }}>
          Home Website
        </Button>
      </Box>

      {!downLG && <Box sx={{ width: '100%' }} />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
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
            Quick Links
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Navigate quickly to essential sections
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, sm: 2.5 } }}>
          <Box>
            {/* Navigation */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#064856', fontSize: { xs: '0.875rem', sm: '0.95rem' } }}
            >
              Navigation
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 0.75, sm: 1 },
                mb: { xs: 2, sm: 3 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'space-between', sm: 'flex-start' }
              }}
            >
              {[
                { icon: <DashboardOutlined />, title: 'Dashboard', path: '/portal/dashboard' },
                { icon: <UnorderedListOutlined />, title: 'Queue', path: '/portal/queue' },
                { icon: <MessageOutlined />, title: 'Chats', path: '/portal/chats' },
                { icon: <BellOutlined />, title: 'Notifications', path: '/portal/notifications' }
              ].map((item) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    width: { xs: 'calc(50% - 6px)', sm: '120px' },
                    height: { xs: '80px', sm: '100px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: '#E0E0E0',
                    borderRadius: { xs: 1, sm: 1.5 },
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    '&:hover': {
                      borderColor: '#008E86',
                      bgcolor: 'rgba(0, 142, 134, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 142, 134, 0.15)'
                    }
                  }}
                  onClick={() => {
                    navigate(item.path);
                    handleCloseModal();
                  }}
                >
                  <Box sx={{ fontSize: { xs: '24px', sm: '32px' }, color: '#008E86', mb: { xs: 0.5, sm: 1 } }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' }, lineHeight: 1.2 }}>
                    {item.title}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Management */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#064856', fontSize: { xs: '0.875rem', sm: '0.95rem' } }}
            >
              Management
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 0.75, sm: 1 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'space-between', sm: 'flex-start' }
              }}
            >
              {[
                { icon: <FileTextOutlined />, title: 'Tickets', path: '/portal/tickets' },
                { icon: <TeamOutlined />, title: 'Support Agents', path: '/portal/users/supports' },
                { icon: <UserOutlined />, title: 'Customers', path: '/portal/users/customers' }
              ].map((item) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    width: { xs: 'calc(50% - 6px)', sm: '120px' },
                    height: { xs: '80px', sm: '100px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: '#E0E0E0',
                    borderRadius: { xs: 1, sm: 1.5 },
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    '&:hover': {
                      borderColor: '#008E86',
                      bgcolor: 'rgba(0, 142, 134, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 142, 134, 0.15)'
                    }
                  }}
                  onClick={() => {
                    navigate(item.path);
                    handleCloseModal();
                  }}
                >
                  <Box sx={{ fontSize: { xs: '24px', sm: '32px' }, color: '#008E86', mb: { xs: 0.5, sm: 1 } }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' }, lineHeight: 1.2 }}>
                    {item.title}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 1.5 } }}>
          <Button
            onClick={handleCloseModal}
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

      <Tooltip  title="Settings"  disableInteractive>
        <IconButton  onClick={() => setOpenSettings(true)} sx={{ color: 'text.primary', ml: 0.5, marginInline:1 }} size="small">
          <SettingOutlined   style={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      {!downLG && <Profile />}
      {downLG && <MobileSection />}

      {/* Right Drawer - Settings */}
      <Drawer
        anchor="right"
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        PaperProps={{
          sx: { width: 300, p: 0 }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#064856' }}>
            Settings
          </Typography>
          <IconButton size="small" onClick={() => setOpenSettings(false)} sx={{ color: 'text.secondary' }}>
            ✕
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, pt: 3 }}>
          {/* Status Section */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              mb: 2
            }}
          >
            Availability Status
          </Typography>
          <Select
            value={status}
            onChange={(e) => handleToggleStatus(e.target.value)}
            disabled={statusLoading}
            size="small"
            fullWidth
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              color: status === 'available' ? '#008E86' : status === 'busy' ? '#B53654' : '#CC9000',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: status === 'available' ? '#008E86' : status === 'busy' ? '#B53654' : '#CC9000'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: status === 'available' ? '#064856' : status === 'busy' ? '#82273B' : '#B37E00'
              }
            }}
            renderValue={(val) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: val === 'available' ? '#008E86' : val === 'busy' ? '#B53654' : '#CC9000'
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {val}
                </Typography>
              </Box>
            )}
          >
            <MenuItem value="available">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#008E86' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Available
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="busy">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#B53654' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Busy
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="away">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#CC9000' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Away
                </Typography>
              </Box>
            </MenuItem>
          </Select>
        </Box>
      </Drawer>
    </>
  );
}
