import { Snackbar, Alert, Typography, Drawer, Select, MenuItem, Tooltip, IconButton, Box } from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { mutate } from 'swr';
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from 'utils/auth';
import { getChats } from 'api/chatApi';

import Users from 'api/users';
import socketService from 'services/socketService';
import useConfig from 'hooks/useConfig';
import useMediaQuery from '@mui/material/useMediaQuery';
import Switch from '@mui/material/Switch';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';
import QuickLinksDrawer from '../../../../components/quick-links/QuickLinksDrawer';

const PRESET_COLORS = [
  { key: 'default', label: 'Teal', color: '#008E86' },
  { key: 'theme1', label: 'Dark Teal', color: '#3B7080' },
  { key: 'theme3', label: 'Gold', color: '#FFB400' }
];

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('available');
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeChatsCount, setActiveChatsCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success', color: null });

  const { mode: colorSchemeMode, setMode } = useColorScheme();
  const { state: configState, setField } = useConfig();
  const isDark = colorSchemeMode === 'dark';

  const STATUS_COLORS = {
    available: theme.vars.palette.success.main,
    busy: theme.vars.palette.error.main,
    away: theme.vars.palette.warning.main
  };

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
          } catch (_) {}
          setStatus('busy');
        } else if (activeCount === 0 && freshUser.status === 'busy') {
          try {
            await Users.updateUserStatus(freshUser.id, 'available');
          } catch (_) {}
          setStatus('available');
        } else {
          setStatus(freshUser.status || 'available');
        }
      } catch (_) {}
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
        } catch (_) {}
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
      {!downLG && <Box sx={{ width: '100%' }} />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <QuickLinksDrawer
        open={openModal}
        onClose={handleCloseModal}
        activeChatsCount={activeChatsCount}
        pendingChatsCount={0}
        unreadNotificationsCount={0}
      />

      <Select
        value={status}
        onChange={(e) => handleToggleStatus(e.target.value)}
        disabled={statusLoading || activeChatsCount > 0}
        size="small"
        title={activeChatsCount > 0 ? `Locked — ${activeChatsCount} active chat${activeChatsCount > 1 ? 's' : ''}` : undefined}
        variant="standard"
        disableUnderline
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            py: 0.5,
            px: 1,
            borderRadius: '999px',
            border: `1.5px solid ${STATUS_COLORS[status]}60`,
            transition: 'border-color 0.2s, background 0.2s',
            '&:hover': {
              borderColor: STATUS_COLORS[status],
              bgcolor: STATUS_COLORS[status] + '10',
            },
          },
          '&.Mui-disabled .MuiSelect-select': {
            opacity: 0.6,
            cursor: 'not-allowed',
          },
          '& .MuiSelect-icon': { color: STATUS_COLORS[status], fontSize: 16, top: 'calc(50% - 8px)', right: 4 },
        }}
        renderValue={(val) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, bgcolor: STATUS_COLORS[val] }} />
            <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', color: STATUS_COLORS[val], lineHeight: 1, fontSize: '0.8rem' }}>
              {val}
            </Typography>
          </Box>
        )}
      >
        <MenuItem value="available">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS.available }} />
            <Typography variant="body2" fontWeight={600}>Available</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="away">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS.away }} />
            <Typography variant="body2" fontWeight={600}>Away</Typography>
          </Box>
        </MenuItem>
      </Select>

      <Tooltip title="Timora Apps" disableInteractive>
        <IconButton onClick={handleOpenModal} sx={{ color: 'text.primary', ml: 0.5, marginInline: 1 }} size="small">
          <AppstoreOutlined style={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

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
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
              color: STATUS_COLORS[status],
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: STATUS_COLORS[status]
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: STATUS_COLORS[status]
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
                    bgcolor: val === 'available' ? STATUS_COLORS.available : val === 'busy' ? STATUS_COLORS.busy : STATUS_COLORS.away
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
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS.available }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Available
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="away">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS.away }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Away
                </Typography>
              </Box>
            </MenuItem>
          </Select>
          {activeChatsCount > 0 && (
            <Typography variant="caption" sx={{ mt: 1.25, display: 'block', color: 'error.main', fontWeight: 500 }}>
              Status is locked while you have {activeChatsCount} active chat{activeChatsCount > 1 ? 's' : ''}.
            </Typography>
          )}
        </Box>

        {/* ── Dark Mode ── */}
        <Box sx={{ px: 2.5, pt: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              mb: 1.5
            }}
          >
            Appearance
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1,
              px: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ fontSize: 16, lineHeight: 1 }}>
                {isDark ? '🌙' : '☀️'}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </Box>
            <Switch
              checked={isDark}
              onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' }
              }}
            />
          </Box>
        </Box>

        {/* ── Theme Color ── */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              mb: 1.5
            }}
          >
            Theme Color
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {PRESET_COLORS.map((preset) => {
              const isActive = (configState.presetColor || 'default') === preset.key;
              return (
                <Tooltip key={preset.key} title={preset.label} disableInteractive>
                  <Box
                    onClick={() => setField('presetColor', preset.key)}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 2,
                      bgcolor: preset.color,
                      cursor: 'pointer',
                      border: isActive ? '3px solid' : '3px solid transparent',
                      borderColor: isActive ? 'text.primary' : 'transparent',
                      outline: isActive ? `2px solid ${preset.color}` : 'none',
                      outlineOffset: 2,
                      transition: 'all 0.15s',
                      '&:hover': { transform: 'scale(1.12)' }
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
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
