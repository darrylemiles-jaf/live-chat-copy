/**
 * Transform a raw API user to the agent-status shape used on the dashboard.
 * @param {object} user
 * @returns {object}
 */
export const transformAgentStatus = (user) => {
  const name = user.name || user.username;
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  return {
    id: user.id,
    name,
    status: user.status ? user.status.toLowerCase() : 'available',
    avatar: initials,
    profile_picture: user.profile_picture
  };
};

/**
 * Transform a raw queue API chat into the queue item shape used on the dashboard.
 * @param {object} chat
 * @returns {object}
 */
export const transformQueueItem = (chat) => {
  const client = chat.client || {};
  const lastMessage =
    chat.messages && chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1].message_text
      : 'Waiting for response...';

  const waitTimeMs = chat.waiting_time || 0;
  const waitTimeSeconds = Math.floor(waitTimeMs / 1000);
  const minutes = Math.floor(waitTimeSeconds / 60);
  const seconds = waitTimeSeconds % 60;
  const waitTimeFormatted = `${minutes}m ${seconds}s`;

  let priority = 'Low';
  if (waitTimeSeconds > 600) priority = 'High';
  else if (waitTimeSeconds > 300) priority = 'Medium';

  return {
    id: chat.id,
    name: client.name || client.username || 'Unknown',
    email: client.email || 'N/A',
    lastMessage,
    waitTime: waitTimeFormatted,
    wait: waitTimeFormatted,
    topic: 'General Support',
    priority,
    avatar: null,
    online: true
  };
};

/**
 * Transform a raw API chat into the recent-chat shape used on the dashboard.
 * @param {object} chat
 * @returns {object}
 */
export const transformRecentChat = (chat) => {
  const client = chat.client || {};
  const lastMessage =
    chat.last_message ||
    chat.messages?.[chat.messages?.length - 1]?.message_text ||
    'No messages yet';

  const chatDate = new Date(chat.updated_at || chat.created_at);
  const now = new Date();
  const diffMs = now - chatDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo = '';
  if (diffMins < 1) timeAgo = 'Just now';
  else if (diffMins < 60) timeAgo = `${diffMins}m`;
  else if (diffHours < 24) timeAgo = `${diffHours}h`;
  else timeAgo = `${diffDays}d`;

  const clientName = client.name || client.username || 'Unknown User';
  const initials = clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: chat.id,
    name: clientName,
    message: lastMessage,
    time: timeAgo,
    avatar: initials,
    clientEmail: client.email
  };
};

/**
 * Get up to 2 uppercase initials from a name.
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .replace(/\./g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

/**
 * Format a total-seconds value as a human-readable duration string.
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds === 0) return '0s';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

/**
 * Return an avatar background colour based on queue item priority.
 * @param {object} palette  MUI theme palette
 * @param {object} item     queue item with an optional `priority` field
 * @returns {string|undefined}
 */
export const getAvatarBg = (palette, item) => {
  if (!palette) return undefined;
  if (item?.priority === 'High') return palette.error.main;
  if (item?.priority === 'Medium') return palette.warning.main;
  if (item?.priority === 'Low') return palette.success.main;
  return palette.primary.main;
};
