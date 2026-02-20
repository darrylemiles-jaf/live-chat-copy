import React, { useState, useEffect, useCallback } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'
import { getCurrentUser } from '../../utils/auth'
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../api/chatApi'
import socketService from '../../services/socketService'

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Notifications' }
];

// Group notifications by date label
const groupByDate = (notifications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {};

  notifications.forEach((n) => {
    const date = new Date(n.created_at);
    date.setHours(0, 0, 0, 0);

    let label;
    if (date.getTime() === today.getTime()) {
      label = 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return groups;
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

const Notifications = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [selectedTab, setSelectedTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilters, setTypeFilters] = useState({ message: true, assignment: true });

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await getNotifications(user.id, pageNum, 30);
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
      setInitialLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Listen for real-time notifications (socket connected globally in DashboardLayout)
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const socket = socketService.socket;
    if (socket) {
      socket.off('new_notification', handleNewNotification);
      socket.on('new_notification', handleNewNotification);
    }

    // Poll briefly in case socket wasn't ready yet
    const interval = setInterval(() => {
      const s = socketService.socket;
      if (s) {
        s.off('new_notification', handleNewNotification);
        s.on('new_notification', handleNewNotification);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      const s = socketService.socket;
      if (s) s.off('new_notification', handleNewNotification);
    };
  }, []);

  const toggleTypeFilter = (key) => {
    setTypeFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    // Mark as read
    if (!notification.is_read && user?.id) {
      try {
        await markNotificationAsRead(notification.id, user.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Failed to mark as read:', e);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const handleGoToChat = (chatId) => {
    if (chatId) {
      navigate('/portal/chats');
    }
    handleCloseModal();
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    // Filter by type
    filtered = filtered.filter((n) => {
      if (n.type === 'new_message' && !typeFilters.message) return false;
      if (n.type === 'chat_assigned' && !typeFilters.assignment) return false;
      return true;
    });

    // Filter by read status
    if (selectedTab === 'Unread') {
      filtered = filtered.filter((n) => !n.is_read);
    }

    // Filter by date
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((n) => new Date(n.created_at) >= today);
    } else if (dateFilter === 'yesterday') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter((n) => {
        const d = new Date(n.created_at);
        return d >= yesterday && d < today;
      });
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupByDate(filteredNotifications);
  const groupKeys = Object.keys(groupedNotifications);

  // Get display info for notification type
  const getTypeInfo = (type) => {
    switch (type) {
      case 'new_message':
        return {
          label: 'New Message',
          avatar: 'M',
          backgroundColor: '#008E86'
        };
      case 'chat_assigned':
        return {
          label: 'Chat Assigned',
          avatar: 'A',
          backgroundColor: '#5B8A96'
        };
      default:
        return {
          label: 'Notification',
          avatar: 'N',
          backgroundColor: '#9FBCBF'
        };
    }
  };

  const getIcon = (type) => {
    const info = getTypeInfo(type);
    return (
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 600,
          flexShrink: 0,
          textTransform: 'uppercase',
          backgroundColor: info.backgroundColor
        }}
      >
        {info.avatar}
      </div>
    );
  };

  const NotificationItem = ({ notification }) => {
    const typeInfo = getTypeInfo(notification.type);
    const isUnread = !notification.is_read;

    return (
      <div
        onClick={() => handleNotificationClick(notification)}
        style={{
          padding: '10px 12px',
          display: 'flex',
          gap: '10px',
          backgroundColor: isUnread ? '#C8E6E3' : '#fff',
          borderBottom: '1px solid #E6EBEE',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isUnread ? '#B5DCD8' : '#F8FAFB';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isUnread ? '#C8E6E3' : '#fff';
        }}
      >
        <div style={{ flexShrink: 0 }}>
          {getIcon(notification.type)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#2C3E50', wordBreak: 'break-word' }}>
                  {typeInfo.label}
                </span>
                {notification.chat_id && (
                  <span
                    style={{
                      padding: '2px 6px',
                      backgroundColor: '#E0F0F1',
                      color: '#008E86',
                      fontSize: '9px',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  >
                    Chat #{notification.chat_id}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#7F8C9F', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {notification.message}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', color: '#A0AEC0', whiteSpace: 'nowrap' }}>
                {formatTimeAgo(notification.created_at)}
              </span>
              {isUnread && (
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#008E86'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Notifications"
        links={breadcrumbLinks}
        subheading={`View and manage your notifications here.${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 2.5 }, alignItems: 'flex-start', marginBottom: '8px' }}>
        {/* Sidebar */}
        <Box component="aside" sx={{ width: { xs: '100%', md: '260px' }, padding: '0', position: { xs: 'static', md: 'sticky' }, top: '96px', alignSelf: 'flex-start' }}>
          {/* Filters Card */}
          <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: { xs: 1.5, sm: 1.5 }, marginBottom: 1.5 }}>
            <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '15px', color: '#2C3E50', fontWeight: 600 }}>Filters</h4>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <label style={{ fontSize: '13px', color: '#718096', fontWeight: 500 }}>Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#2C3E50',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                </select>
              </Box>

              <Box>
                <label style={{ fontSize: '13px', color: '#718096', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Type</label>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <button
                    onClick={() => toggleTypeFilter('message')}
                    style={{
                      padding: '7px 8px',
                      backgroundColor: typeFilters.message ? '#008E86' : 'transparent',
                      color: typeFilters.message ? '#fff' : '#718096',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      flex: '1',
                      minWidth: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => toggleTypeFilter('assignment')}
                    style={{
                      padding: '7px 8px',
                      backgroundColor: typeFilters.assignment ? '#008E86' : 'transparent',
                      color: typeFilters.assignment ? '#fff' : '#718096',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      flex: '1',
                      minWidth: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Assignments
                  </button>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* View Card */}
          <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: { xs: 1.5, sm: 1.5 } }}>
            <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '15px', color: '#2C3E50', fontWeight: 600 }}>View</h4>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['All', 'Unread'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  style={{
                    padding: '7px 12px',
                    backgroundColor: selectedTab === tab ? '#008E86' : 'transparent',
                    color: selectedTab === tab ? '#fff' : '#718096',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedTab === tab ? 600 : 500,
                    textAlign: 'left'
                  }}
                >
                  {tab}
                  {tab === 'Unread' && unreadCount > 0 && (
                    <span style={{
                      marginLeft: '6px',
                      padding: '1px 6px',
                      backgroundColor: selectedTab === tab ? 'rgba(255,255,255,0.3)' : '#008E86',
                      color: '#fff',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Main Content Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

          {/* Initial Loading */}
          {initialLoading && (
            <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '60px 20px', textAlign: 'center' }}>
              <CircularProgress size={32} sx={{ color: '#008E86' }} />
              <p style={{ fontSize: '14px', color: '#718096', marginTop: '12px' }}>Loading notifications...</p>
            </Box>
          )}

          {/* Main Content */}
          {!initialLoading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 1.5 } }}>
              {groupKeys.map((dateLabel) => (
                <div key={dateLabel} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ padding: { xs: '10px 12px', sm: '14px 16px' }, borderBottom: '1px solid #E6EBEE', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#2C3E50' }}>
                      {dateLabel}
                      <span style={{ fontSize: '12px', fontWeight: 400, color: '#A0AEC0', marginLeft: '8px' }}>
                        ({groupedNotifications[dateLabel].length})
                      </span>
                    </h3>
                    {dateLabel === groupKeys[0] && unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        style={{
                          padding: '7px 12px',
                          backgroundColor: '#fff',
                          color: '#008E86',
                          border: '1px solid #008E86',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#008E86';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.color = '#008E86';
                        }}
                      >
                        Mark all as Read
                      </button>
                    )}
                  </Box>
                  <div>
                    {groupedNotifications[dateLabel].map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && !loading && filteredNotifications.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleLoadMore}
                    style={{
                      padding: '9px 24px',
                      backgroundColor: '#fff',
                      color: '#008E86',
                      border: '1px solid #008E86',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#008E86';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.color = '#008E86';
                    }}
                  >
                    Load More
                  </button>
                </div>
              )}

              {loading && !initialLoading && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#008E86' }} />
                </Box>
              )}

              {/* Empty State */}
              {filteredNotifications.length === 0 && !loading && (
                <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: { xs: '40px 20px', sm: '60px 20px' }, textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', color: '#CBD5E0' }}>🔔</div>
                  <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>
                    {selectedTab === 'Unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#A0AEC0', margin: '8px 0 0' }}>
                    {selectedTab === 'Unread' ? "You're all caught up!" : 'Notifications will appear here when clients message you or chats are assigned.'}
                  </p>
                </Box>
              )}
            </Box>
          )}

        </div>
      </Box>

      {/* Notification Modal */}
      {isModalOpen && selectedNotification && (
        <Box
          onClick={handleCloseModal}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: { xs: 1, sm: 2 }
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              backgroundColor: '#fff',
              borderRadius: { xs: 1, sm: '4px' },
              padding: { xs: 2, sm: 2.5 },
              maxWidth: '600px',
              width: '100%',
              maxHeight: { xs: '90vh', sm: '80vh' },
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{ flexShrink: 0 }}>
                  {getIcon(selectedNotification.type)}
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, wordBreak: 'break-word' }}>
                  {getTypeInfo(selectedNotification.type).label}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
                {selectedNotification.message}
              </p>

              <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                {selectedNotification.chat_id && (
                  <p style={{ margin: '6px 0' }}>
                    <strong>Chat:</strong>{' '}
                    <span
                      style={{
                        padding: '2px 7px',
                        backgroundColor: '#E0F0F1',
                        color: '#008E86',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}
                    >
                      #{selectedNotification.chat_id}
                    </span>
                  </p>
                )}
                <p style={{ margin: '6px 0' }}>
                  <strong>Type:</strong> {getTypeInfo(selectedNotification.type).label}
                </p>
                <p style={{ margin: '6px 0' }}>
                  <strong>Time:</strong> {formatTimeAgo(selectedNotification.created_at)}
                </p>
                <p style={{ margin: '6px 0' }}>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: selectedNotification.is_read ? '#A0AEC0' : '#008E86', fontWeight: 500 }}>
                    {selectedNotification.is_read ? 'Read' : 'Unread'}
                  </span>
                </p>
              </div>
            </div>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, marginTop: 2, paddingTop: 2, borderTop: '1px solid #E6EBEE' }}>
              {selectedNotification.chat_id && (
                <button
                  onClick={() => handleGoToChat(selectedNotification.chat_id)}
                  style={{
                    padding: '9px 20px',
                    backgroundColor: '#008E86',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Go to Chat
                </button>
              )}
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '9px 20px',
                  backgroundColor: '#F7FAFC',
                  color: '#2C3E50',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </Box>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default Notifications;