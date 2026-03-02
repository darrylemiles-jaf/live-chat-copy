import React from 'react';
import { getTypeInfo, formatTimeAgo } from '../../utils/notifications/notificationTransformers';
import NotificationIcon from './NotificationIcon';

const NotificationItem = ({ notification, onClick }) => {
  const typeInfo = getTypeInfo(notification.type);
  const isUnread = !notification.is_read;

  return (
    <div
      onClick={() => onClick(notification)}
      style={{
        padding: '10px 12px',
        display: 'flex',
        gap: '10px',
        backgroundColor: isUnread ? '#C8E6E3' : '#fff',
        borderBottom: '1px solid #E6EBEE',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isUnread ? '#B5DCD8' : '#F8FAFB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isUnread ? '#C8E6E3' : '#fff';
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <NotificationIcon type={notification.type} />
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
                color: '#7F8C9F',
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
            <span style={{ fontSize: '11px', color: '#A0AEC0', whiteSpace: 'nowrap' }}>
              {formatTimeAgo(notification.created_at)}
            </span>
            {isUnread && (
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#008E86',
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
