// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import { mutate } from 'swr';

// project import
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';
import QuickLinksDialog from 'components/QuickLinksDialog/QuickLinksDialog';
import {
  Button,
  Stack,
  Snackbar,
  Alert,
  Typography,
  Drawer,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from 'utils/auth';
import Users from 'api/users';
import { getChats } from 'api/chatApi';
import socketService from 'services/socketService';
import {
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
  const [activeChatsCount, setActiveChatsCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success', color: null });

  const STATUS_COLORS = { available: '#008E86', busy: '#B53654', away: '#CC9000' };

  useEffect(() => {
    let attached = false;
    let attachedSocket = null;
    let heartbeatTimer = null;

    const getUid = () => getCurrentUser()?.id;

    const syncStatus = async () => {
      const uid = getUid();
      if (!uid) return;
      try {
        const [userRes, chatRes] = await Promise.all([Users.getSingleUser(uid), getChats(uid)]);
        if (!userRes?.success || !userRes?.data) return;
        const freshUser = userRes.data;
        const chats = Array.isArray(chatRes) ? chatRes : chatRes?.data || [];
        const activeCount = chats.filter((c) => c.status === 'active').length;
        setActiveChatsCount(activeCount);
        if (activeCount > 0 && freshUser.status !== 'busy') {
          try {
            await Users.updateUserStatus(freshUser.id, 'busy');
          } catch (_) { }
          setStatus('busy');
        } else if (activeCount === 0 && freshUser.status === 'busy') {
          try {
            await Users.updateUserStatus(freshUser.id, 'available');
          } catch (_) { }
          setStatus('available');
        } else {
          setStatus(freshUser.status || 'available');
        }
      } catch (_) { }
    };

    const handleUserStatusChange = (data) => {
      if (data.userId == getUid()) {
        setStatus(data.status);
        syncStatus();
      }
    };

    const handleChatAssigned = () => {
      setStatus('busy');
      syncStatus();
    };

    const handleChatStatusUpdate = () => {
      syncStatus();
    };

    const tryAttach = () => {
      const s = socketService.socket;
      if (!s || attached) return;
      s.on('user_status_changed', handleUserStatusChange);
      s.on('chat_assigned', handleChatAssigned);
      s.on('chat_status_update', handleChatStatusUpdate);
      s.on('queue_update', syncStatus);
      attachedSocket = s;
      attached = true;
    };

    const init = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser?.id) return;
      try {
        const res = await Users.getSingleUser(currentUser.id);
        if (!res?.success || !res?.data) {
          logout();
          return;
        }
        const freshUser = res.data;
        setUser(freshUser);
        try {
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (_) { }
      } catch (_) {
        logout();
        return;
      }
      await syncStatus();
    };

    init();

    tryAttach();
    const retryInterval = setInterval(() => {
      if (attached) {
        clearInterval(retryInterval);
        return;
      }
      tryAttach();
    }, 300);

    heartbeatTimer = setInterval(syncStatus, 5000);

    return () => {
      clearInterval(retryInterval);
      clearInterval(heartbeatTimer);
      if (attachedSocket && attached) {
        attachedSocket.off('user_status_changed', handleUserStatusChange);
        attachedSocket.off('chat_assigned', handleChatAssigned);
        attachedSocket.off('chat_status_update', handleChatStatusUpdate);
        attachedSocket.off('queue_update', syncStatus);
      }
    };
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
        const label = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        setSnackbar({ open: true, message: `Status updated to ${label}`, severity: 'success', color: STATUS_COLORS[newStatus] || null });
        setOpenSettings(false);
      } else {
        setSnackbar({ open: true, message: response?.message || 'Failed to update status', severity: 'error' });
      }
    } catch (e) {
      console.error('Failed to update status:', e.message);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
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
      </Box>

      {!downLG && <Box sx={{ width: '100%' }} />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <QuickLinksDialog
        open={openModal}
        onClose={handleCloseModal}
        activeChatsCount={activeChatsCount}
        pendingChatsCount={0}
        availableAgentsCount={0}
        unreadNotificationsCount={0}
      />

      <Notification />

      <Tooltip title="Settings" disableInteractive>
        <IconButton onClick={() => setOpenSettings(true)} sx={{ color: 'text.primary', ml: 0.5, marginInline: 1 }} size="small">
          <SettingOutlined style={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      {!downLG && <Profile />}
      {downLG && <MobileSection />}

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
            disabled={statusLoading || activeChatsCount > 0}
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
          {activeChatsCount > 0 && (
            <Typography variant="caption" sx={{ mt: 1.25, display: 'block', color: '#B53654', fontWeight: 500 }}>
              Status is locked while you have {activeChatsCount} active chat{activeChatsCount > 1 ? 's' : ''}.
            </Typography>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            ...(snackbar.color && {
              bgcolor: snackbar.color,
              '& .MuiAlert-icon': { color: 'white' },
              '& .MuiAlert-action .MuiIconButton-root': { color: 'white' }
            })
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
