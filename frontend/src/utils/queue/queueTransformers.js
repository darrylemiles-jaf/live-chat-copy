export function getInitials(name) {
  if (!name) return '?';
  return name
    .replace(/\./g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function getAvatarBg(palette, item) {
  if (!palette) return undefined;
  if (item?.priority === 'High') return palette.error.main;
  if (item?.priority === 'Medium') return palette.warning.main;
  if (item?.priority === 'Low') return palette.success.main;
  return palette.primary.main;
}

export function formatWaitTime(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `Waiting ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  return `Waiting ${diffHours}h ${diffMins % 60}m`;
}

export function transformQueueData(item) {
  return {
    id: item.id,
    name: item.client?.name || 'Unknown',
    wait: formatWaitTime(item.created_at),
    email: item.client?.email || 'N/A',
    lastMessage: item.messages?.[item.messages.length - 1]?.message || 'No messages',
    priority: item.waiting_time > 600000 ? 'High' : item.waiting_time > 300000 ? 'Medium' : 'Low',
    avatar: `/src/assets/images/users/avatar-${(item.id % 8) + 1}.png`,
    online: true,
    orderId: `#${item.id}`,
    status: 'In Queue',
    issue: item.messages?.[0]?.message || 'No issue description',
    notes: `Customer has been waiting ${formatWaitTime(item.created_at)}`,
    client_id: item.client_id,
    agent_id: item.agent_id,
    created_at: item.created_at,
    messages: item.messages || [],
  };
}
