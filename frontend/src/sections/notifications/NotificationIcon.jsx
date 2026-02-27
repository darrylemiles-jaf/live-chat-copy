import React from 'react';
import { getTypeInfo } from '../../utils/notifications/notificationTransformers';

const NotificationIcon = ({ type }) => {
  const { avatar, backgroundColor } = getTypeInfo(type);

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
        backgroundColor,
      }}
    >
      {avatar}
    </div>
  );
};

export default NotificationIcon;
