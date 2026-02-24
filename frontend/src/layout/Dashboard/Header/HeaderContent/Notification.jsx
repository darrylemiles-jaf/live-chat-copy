import { useRef, useState, useEffect, useCallback } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { getCurrentUser } from 'utils/auth';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from 'api/chatApi';
import socketService from 'services/socketService';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

import { useNavigate } from 'react-router-dom';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// Format relative time
const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Get icon and color by notification type
const getNotificationStyle = (type) => {
  switch (type) {
    case 'new_message':
      return { icon: <MessageOutlined />, color: 'primary.main', bgcolor: 'primary.lighter', label: 'New Message' };
    case 'chat_assigned':
      return { icon: <UserAddOutlined />, color: 'success.main', bgcolor: 'success.lighter', label: 'Chat Assigned' };
    case 'queue_new':
      return { icon: <ClockCircleOutlined />, color: 'warning.main', bgcolor: 'warning.lighter', label: 'New in Queue' };
    default:
      return { icon: <InfoCircleOutlined />, color: 'warning.main', bgcolor: 'warning.lighter', label: 'Notification' };
  }
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const user = getCurrentUser();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await getNotifications(user.id, pageNum, 20);
      if (result?.success) {
        if (append) {
          setNotifications((prev) => [...prev, ...result.data]);
        } else {
          setNotifications(result.data);
        }
        setUnreadCount(result.unread_count || 0);
        setHasMore(pageNum < result.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log('🔔 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    let attached = false;
    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) {
        s.on('new_notification', handleNewNotification);
        attached = true;
        console.log('🔔 Notification socket listener attached');
      }
    };
    tryAttach();
    const retry = setInterval(() => {
      if (attached) { clearInterval(retry); return; }
      tryAttach();
    }, 500);

    return () => {
      clearInterval(retry);
      const s = socketService.socket;
      if (s && attached) s.off('new_notification', handleNewNotification);
    };
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read && user?.id) {
      try {
        await markNotificationAsRead(notification.id, user.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate to the chat if chat_id is present
    if (notification.chat_id) {
      if (notification.type === 'queue_new') {
        navigate('/portal/queue', { state: { queueId: notification.chat_id } });
      } else {
        navigate('/portal/chats', { state: { chatId: notification.chat_id } });
      }
      setOpen(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={(theme) => ({
          color: 'text.primary',
          bgcolor: open ? 'grey.100' : 'transparent',
        })}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifications"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unreadCount > 0 && (
                        <Tooltip title="Mark all as read">
                          <IconButton color="success" size="small" onClick={handleMarkAllRead}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      maxHeight: 400,
                      overflowY: 'auto',
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        px: 2,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length === 0 && !loading && (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <BellOutlined style={{ fontSize: 32, color: '#ccc' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          No notifications yet
                        </Typography>
                      </Box>
                    )}

                    {notifications.map((notification) => {
                      const style = getNotificationStyle(notification.type);
                      return (
                        <ListItem
                          key={notification.id}
                          component={ListItemButton}
                          divider
                          selected={!notification.is_read}
                          onClick={() => handleNotificationClick(notification)}
                          secondaryAction={
                            <Typography variant="caption" noWrap>
                              {formatTimeAgo(notification.created_at)}
                            </Typography>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ color: style.color, bgcolor: style.bgcolor }}>
                              {style.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                                {style.label}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 200
                                }}
                              >
                                {notification.message}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}

                    {loading && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}

                    {hasMore && notifications.length > 0 && !loading && (
                      <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }} onClick={handleLoadMore}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="primary">
                              Load More
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
