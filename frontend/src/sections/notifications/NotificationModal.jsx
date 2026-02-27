import React from 'react';
import { Box } from '@mui/material';
import { getTypeInfo, formatTimeAgo } from '../../utils/notifications/notificationTransformers';
import NotificationIcon from './NotificationIcon';

const NotificationModal = ({ notification, onClose, onGoToChat }) => {
  if (!notification) return null;

  const typeInfo = getTypeInfo(notification.type);

  return (
    <Box
      onClick={onClose}
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
        padding: { xs: 1, sm: 2 },
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0 }}>
              <NotificationIcon type={notification.type} />
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, wordBreak: 'break-word' }}>
              {typeInfo.label}
            </h2>
          </div>
          <button
            onClick={onClose}
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
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
            {notification.message}
          </p>

          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
            {notification.chat_id && (
              <p style={{ margin: '6px 0' }}>
                <strong>Chat:</strong>{' '}
                <span
                  style={{
                    padding: '2px 7px',
                    backgroundColor: '#E0F0F1',
                    color: '#008E86',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  #{notification.chat_id}
                </span>
              </p>
            )}
            <p style={{ margin: '6px 0' }}>
              <strong>Type:</strong> {typeInfo.label}
            </p>
            <p style={{ margin: '6px 0' }}>
              <strong>Time:</strong> {formatTimeAgo(notification.created_at)}
            </p>
            <p style={{ margin: '6px 0' }}>
              <strong>Status:</strong>{' '}
              <span style={{ color: notification.is_read ? '#A0AEC0' : '#008E86', fontWeight: 500 }}>
                {notification.is_read ? 'Read' : 'Unread'}
              </span>
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            marginTop: 2,
            paddingTop: 2,
            borderTop: '1px solid #E6EBEE',
          }}
        >
          {notification.chat_id && (
            <button
              onClick={() => onGoToChat(notification)}
              style={{
                padding: '9px 20px',
                backgroundColor: '#008E86',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {notification.type === 'queue_new' ? 'Go to Queue' : 'Go to Chat'}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              backgroundColor: '#F7FAFC',
              color: '#2C3E50',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationModal;
