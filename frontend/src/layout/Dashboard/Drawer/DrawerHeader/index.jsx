import { useState, useEffect } from 'react';
import { getCurrentUser } from 'utils/auth';
import { getChats } from 'api/chatApi';

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from 'components/logo';
import Users from 'api/users';
import socketService from 'services/socketService';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: '#008E86' },
  { value: 'busy', label: 'Busy', color: '#B53654' },
  { value: 'away', label: 'Away', color: '#CC9000' }
];

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  const [status, setStatus] = useState('available');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id) return;

    const syncStatus = async () => {
      try {
        const [chatRes, userRes] = await Promise.all([getChats(user.id), Users.getSingleUser(user.id)]);
        const chats = Array.isArray(chatRes) ? chatRes : chatRes?.data || [];
        const count = chats.filter((c) => c.status === 'active').length;
        const dbStatus = userRes?.data?.status;

        if (count > 0 && dbStatus !== 'busy') {
          await Users.updateUserStatus(user.id, 'busy');
          setStatus('busy');
        } else if (count === 0 && dbStatus === 'busy') {
          await Users.updateUserStatus(user.id, 'available');
          setStatus('available');
        } else if (dbStatus) {
          setStatus(dbStatus);
        }
      } catch (_) {}
    };
    syncStatus();

    let attached = false;
    let attachedSocket = null;
    const statusHandler = (data) => {
      if (data.userId == user.id) setStatus(data.status);
    };
    const chatAssignedHandler = () => {
      syncStatus();
    };
    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) {
        s.on('user_status_changed', statusHandler);
        s.on('chat_assigned', chatAssignedHandler);
        s.on('queue_update', syncStatus);
        attachedSocket = s;
        attached = true;
      }
    };
    tryAttach();
    const retry = setInterval(() => {
      if (attached) {
        clearInterval(retry);
        return;
      }
      tryAttach();
    }, 500);
    const heartbeat = setInterval(syncStatus, 5000);

    return () => {
      clearInterval(retry);
      clearInterval(heartbeat);
      if (attachedSocket && attached) {
        attachedSocket.off('user_status_changed', statusHandler);
        attachedSocket.off('chat_assigned', chatAssignedHandler);
        attachedSocket.off('queue_update', syncStatus);
      }
    };
  }, []);

  const currentOpt = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: '60px',
        width: 'initial',
        paddingBlock: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 0,
        gap: 0.75
      }}
    >
      <Tooltip title="Timora Live Chat" disableHoverListener={open}>
        <Logo isIcon={!open} sx={{ width: open ? 'auto' : 35, height: 35 }} />
      </Tooltip>

      {open ? (
        <Chip
          size="small"
          label={
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: currentOpt.color, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: currentOpt.color, lineHeight: 1 }}>
                {currentOpt.label}
              </Typography>
            </Stack>
          }
          sx={{
            bgcolor: `${currentOpt.color}18`,
            border: `1.5px solid ${currentOpt.color}`,
            height: 26,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      ) : (
        <Tooltip title={currentOpt.label} placement="right">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: currentOpt.color,
              border: '2px solid white',
              boxShadow: `0 0 0 1.5px ${currentOpt.color}`
            }}
          />
        </Tooltip>
      )}
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
