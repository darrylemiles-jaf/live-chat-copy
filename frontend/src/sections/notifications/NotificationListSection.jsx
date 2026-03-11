import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotificationItem from './NotificationItem';
import { NotificationOutlined } from '@ant-design/icons';

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
  const theme = useTheme();

  const bg = theme.vars.palette.background.paper;
  const border = `1px solid ${theme.vars.palette.divider}`;
  const headerBorder = theme.vars.palette.divider;
  const textPrimary = theme.vars.palette.text.primary;
  const textSecondary = theme.vars.palette.text.secondary;
  const textMuted = theme.vars.palette.text.disabled;

  if (initialLoading) {
    return (
      <Box
        sx={{
          backgroundColor: bg,
          border,
          borderRadius: '4px',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
        <p style={{ fontSize: '14px', color: textSecondary, marginTop: '12px' }}>
          Loading notifications...
        </p>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 1.5 } }}>
      {groupKeys.map((dateLabel) => (
        <div
          key={dateLabel}
          style={{
            backgroundColor: bg,
            border: `1px solid ${theme.vars.palette.divider}`,
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Group header */}
          <Box
            sx={{
              padding: { xs: '10px 12px', sm: '14px 16px' },
              borderBottom: `1px solid ${headerBorder}`,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: textPrimary }}>
              {dateLabel}
              <span style={{ fontSize: '12px', fontWeight: 400, color: textMuted, marginLeft: '8px' }}>
                ({groupedNotifications[dateLabel].length})
              </span>
            </h3>

            {dateLabel === groupKeys[0] && unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                style={{
                  padding: '7px 12px',
                  backgroundColor: theme.vars.palette.background.paper,
                  color: theme.vars.palette.primary.main,
                  border: `1px solid ${theme.vars.palette.primary.main}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.vars.palette.primary.main;
                  e.currentTarget.style.color = theme.vars.palette.primary.contrastText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.vars.palette.background.paper;
                  e.currentTarget.style.color = theme.vars.palette.primary.main;
                }}
              >
                Mark all as Read
              </button>
            )}
          </Box>

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
              backgroundColor: theme.vars.palette.background.paper,
              color: theme.vars.palette.primary.main,
              border: `1px solid ${theme.vars.palette.primary.main}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.vars.palette.primary.main;
              e.currentTarget.style.color = theme.vars.palette.primary.contrastText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.vars.palette.background.paper;
              e.currentTarget.style.color = theme.vars.palette.primary.main;
            }}
          >
            Load More
          </button>
        </div>
      )}

      {loading && !initialLoading && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} sx={{ color: 'primary.main' }} />
        </Box>
      )}

      {filteredNotifications.length === 0 && !loading && (
        <Box
          sx={{
            backgroundColor: bg,
            border,
            borderRadius: '4px',
            padding: { xs: '40px 20px', sm: '60px 20px' },
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px', color: textMuted }}><NotificationOutlined /></div>
          <p style={{ fontSize: '16px', color: textSecondary, margin: 0 }}>
            {selectedTab === 'Unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p style={{ fontSize: '13px', color: textMuted, margin: '8px 0 0' }}>
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
