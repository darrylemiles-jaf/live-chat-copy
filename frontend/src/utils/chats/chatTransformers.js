export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const transformChatData = (chat) => ({
  id: chat.id,
  name: chat.client?.name || chat.client_name || `User ${chat.client_id}`,
  lastMessage:
    chat.last_message ||
    chat.messages?.[chat.messages.length - 1]?.message ||
    'No messages yet',
  timestamp: formatTimestamp(chat.updated_at || chat.created_at),
  rawTimestamp: new Date(chat.updated_at || chat.created_at).getTime(),
  avatar: null,
  unread: 0,
  online: chat.status === 'active',
  status: chat.status,
  email: chat.client?.email || chat.client_email || null,
  username: chat.client?.username || null,
  client_id: chat.client_id,
  agent_name: chat.agent?.name || null,
  created_at: chat.created_at,
  updated_at: chat.updated_at,
  message_count: chat.messages?.length || 0,
});

export const transformMessageData = (message, agentId) => ({
  id: message.id,
  sender:
    message.sender_id === agentId
      ? 'You'
      : message.sender_name || `User ${message.sender_id}`,
  message: message.message,
  timestamp: formatTimestamp(message.created_at),
  isSender: message.sender_id === agentId,
  isBot: message.sender_role === 'bot',
  attachment_url: message.attachment_url,
  attachment_type: message.attachment_type,
  attachment_name: message.attachment_name,
});
