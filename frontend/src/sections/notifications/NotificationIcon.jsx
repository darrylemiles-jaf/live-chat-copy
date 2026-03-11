import React from 'react';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';

const iconConfig = {
  new_message:   { Icon: MessageOutlined,     bg: 'var(--palette-primary-main)' },
  chat_assigned: { Icon: UserAddOutlined,     bg: 'var(--palette-primary-dark)' },
  queue_new:     { Icon: ClockCircleOutlined, bg: 'var(--palette-warning-main)' },
};

const NotificationIcon = ({ type }) => {
  const { Icon = InfoCircleOutlined, bg = 'var(--palette-text-disabled)' } = iconConfig[type] ?? {};

  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '14px',
        flexShrink: 0,
        backgroundColor: bg,
      }}
    >
      <Icon />
    </div>
  );
};

export default NotificationIcon;
