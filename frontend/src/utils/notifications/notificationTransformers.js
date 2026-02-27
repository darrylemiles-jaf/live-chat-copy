export const groupByDate = (notifications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {};

  notifications.forEach((n) => {
    const date = new Date(n.created_at);
    date.setHours(0, 0, 0, 0);

    let label;
    if (date.getTime() === today.getTime()) {
      label = 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return groups;
};

export const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const getTypeInfo = (type) => {
  switch (type) {
    case 'new_message':
      return { label: 'New Message', avatar: 'M', backgroundColor: '#008E86' };
    case 'chat_assigned':
      return { label: 'Chat Assigned', avatar: 'A', backgroundColor: '#5B8A96' };
    default:
      return { label: 'Notification', avatar: 'N', backgroundColor: '#9FBCBF' };
  }
};

export const applyFilters = (notifications, { selectedTab, dateFilter, typeFilters }) => {
  let filtered = [...notifications];

  filtered = filtered.filter((n) => {
    if (n.type === 'new_message' && !typeFilters.message) return false;
    if (n.type === 'chat_assigned' && !typeFilters.assignment) return false;
    return true;
  });

  if (selectedTab === 'Unread') {
    filtered = filtered.filter((n) => !n.is_read);
  }

  if (dateFilter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter((n) => new Date(n.created_at) >= today);
  } else if (dateFilter === 'yesterday') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    filtered = filtered.filter((n) => {
      const d = new Date(n.created_at);
      return d >= yesterday && d < today;
    });
  }

  return filtered;
};
