import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// utils
import { getCurrentUser, logout } from 'utils/auth';
import { getChats, endChat } from 'api/chatApi';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ activeChatsCount = 0 }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleViewProfile = () => {
    navigate('/portal/profile');
  };

  const handleLogoutClick = () => {
    if (activeChatsCount > 0) {
      setConfirmOpen(true);
    } else {
      logout();
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const user = getCurrentUser();
      if (user?.id) {
        const chatRes = await getChats(user.id);
        const chats = Array.isArray(chatRes) ? chatRes : chatRes?.data || [];
        const activeChats = chats.filter((c) => c.status === 'active');
        await Promise.allSettled(activeChats.map((c) => endChat(c.id)));
      }
    } catch (_) {
      // end-chat failures should not block logout
    }
    setConfirmOpen(false);
    await logout();
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton onClick={handleViewProfile}>
          <ListItemIcon>
            <UserOutlined />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </ListItemButton>

        <ListItemButton onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      <Dialog open={confirmOpen} onClose={() => !isLoggingOut && setConfirmOpen(false)}>
        <DialogTitle>Logout while in active chat?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You currently have {activeChatsCount} active chat{activeChatsCount > 1 ? 's' : ''} in progress.
            Logging out will end {activeChatsCount > 1 ? 'these chats' : 'this chat'} and disconnect the client.
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isLoggingOut}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="error"
            variant="contained"
            disabled={isLoggingOut}
            startIcon={isLoggingOut ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isLoggingOut ? 'Ending chats�' : 'Logout Anyway'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ProfileTab.propTypes = { activeChatsCount: PropTypes.number };
