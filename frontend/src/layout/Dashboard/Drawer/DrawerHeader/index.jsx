import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from 'components/logo';
import Users from 'api/users';
import socketService from 'services/socketService';
import { getCurrentUser } from 'utils/auth';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: '#008E86' },
  { value: 'busy',      label: 'Busy',      color: '#B53654' },
  { value: 'away',      label: 'Away',      color: '#CC9000' }
];

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  const [status, setStatus] = useState('available');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id) return;

    Users.getSingleUser(user.id)
      .then((res) => { if (res?.success && res.data?.status) setStatus(res.data.status); })
      .catch(() => {});

    let attached = false;
    const handler = (data) => { if (data.userId === user.id) setStatus(data.status); };
    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) { s.on('user_status_changed', handler); attached = true; }
    };
    tryAttach();
    const retry = setInterval(() => { if (attached) { clearInterval(retry); return; } tryAttach(); }, 500);

    return () => {
      clearInterval(retry);
      const s = socketService.socket;
      if (s && attached) s.off('user_status_changed', handler);
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
        gap: 1,
      }}
    >
      <Tooltip title="Timora Live Chat" disableHoverListener={open}>
        <Logo isIcon={!open} sx={{ width: open ? 'auto' : 35, height: 35 }} />
      </Tooltip>

      {open ? (
        <Box sx={{ width: '100%', px: 2 }}>
          <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.5, mb: 0.5 }}>
            Status:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              border: '1.5px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: currentOpt.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, flex: 1 }}>
              {currentOpt.label}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Tooltip title={currentOpt.label} placement="right">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: currentOpt.color, border: '2px solid white', boxShadow: `0 0 0 1.5px ${currentOpt.color}` }} />
        </Tooltip>
      )}
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };

DrawerHeader.propTypes = { open: PropTypes.bool };
