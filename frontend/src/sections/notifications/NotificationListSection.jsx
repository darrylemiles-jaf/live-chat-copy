import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import NotificationItem from './NotificationItem';

const NotificationListSection = ({
  initialLoading,
  loading,
  groupedNotifications,
  groupKeys,
  filteredNotifications,
  unreadCount,
  hasMore,
  selectedTab,
  onNotificationClick,
  onMarkAllAsRead,
  onLoadMore,
}) => {
  if (initialLoading) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '4px',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <CircularProgress size={32} sx={{ color: '#008E86' }} />
        <p style={{ fontSize: '14px', color: '#718096', marginTop: '12px' }}>
          Loading notifications...
        </p>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 1.5 } }}>
      {/* Grouped notification rows */}
      {groupKeys.map((dateLabel) => (
        <div
          key={dateLabel}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Group header */}
          <Box
            sx={{
              padding: { xs: '10px 12px', sm: '14px 16px' },
              borderBottom: '1px solid #E6EBEE',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#2C3E50' }}>
              {dateLabel}
              <span style={{ fontSize: '12px', fontWeight: 400, color: '#A0AEC0', marginLeft: '8px' }}>
                ({groupedNotifications[dateLabel].length})
              </span>
            </h3>

            {dateLabel === groupKeys[0] && unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                style={{
                  padding: '7px 12px',
                  backgroundColor: '#fff',
                  color: '#008E86',
                  border: '1px solid #008E86',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
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

          {/* Notification rows */}
          <div>
            {groupedNotifications[dateLabel].map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && !loading && filteredNotifications.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onLoadMore}
            style={{
              padding: '9px 24px',
              backgroundColor: '#fff',
              color: '#008E86',
              border: '1px solid #008E86',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
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

      {/* Inline loading spinner */}
      {loading && !initialLoading && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} sx={{ color: '#008E86' }} />
        </Box>
      )}

      {/* Empty state */}
      {filteredNotifications.length === 0 && !loading && (
        <Box
          sx={{
            backgroundColor: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            padding: { xs: '40px 20px', sm: '60px 20px' },
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#CBD5E0' }}>🔔</div>
          <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>
            {selectedTab === 'Unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p style={{ fontSize: '13px', color: '#A0AEC0', margin: '8px 0 0' }}>
            {selectedTab === 'Unread'
              ? "You're all caught up!"
              : 'Notifications will appear here when clients message you or chats are assigned.'}
          </p>
        </Box>
      )}
    </Box>
  );
};

export default NotificationListSection;
