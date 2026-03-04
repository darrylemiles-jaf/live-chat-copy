import React from 'react';
import { useTheme } from '@mui/material/styles';
import { getTypeInfo, formatTimeAgo } from '../../utils/notifications/notificationTransformers';
import NotificationIcon from './NotificationIcon';

const NotificationItem = ({ notification, onClick }) => {
  const theme = useTheme();
  const typeInfo = getTypeInfo(notification.type);
  const isUnread = !notification.is_read;

  const bgNormal = theme.vars.palette.background.paper;
  const bgUnread = 'rgba(var(--palette-primary-mainChannel) / 0.12)';
  const bgHoverNormal = theme.vars.palette.action.hover;
  const bgHoverUnread = 'rgba(var(--palette-primary-mainChannel) / 0.2)';
  const borderColor = theme.vars.palette.divider;
  const textPrimary = theme.vars.palette.text.primary;
  const textSecondary = theme.vars.palette.text.secondary;
  const textMuted = theme.vars.palette.text.disabled;
  const chatBadgeBg = 'rgba(var(--palette-primary-mainChannel) / 0.2)';

  return (
    <div
      onClick={() => onClick(notification)}
      style={{
        padding: '10px 12px',
        display: 'flex',
        gap: '10px',
        backgroundColor: isUnread ? bgUnread : bgNormal,
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isUnread ? bgHoverUnread : bgHoverNormal;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isUnread ? bgUnread : bgNormal;
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <NotificationIcon type={notification.type} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: textPrimary, wordBreak: 'break-word' }}>
                {typeInfo.label}
              </span>
              {notification.chat_id && (
                <span
                  style={{
                    padding: '2px 6px',
                    backgroundColor: chatBadgeBg,
                    color: theme.vars.palette.primary.main,
                    fontSize: '9px',
                    fontWeight: 600,
                    borderRadius: '8px',
                  }}
                >
                  Chat #{notification.chat_id}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: textSecondary,
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {notification.message}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: textMuted, whiteSpace: 'nowrap' }}>
              {formatTimeAgo(notification.created_at)}
            </span>
            {isUnread && (
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: theme.vars.palette.primary.main,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
