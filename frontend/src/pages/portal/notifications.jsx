import React from 'react'
import { Box } from '@mui/material'
import Breadcrumbs from '../../components/@extended/Breadcrumbs'

const breadcrumbLinks = [
  { title: 'Home', to: '/' },
  { title: 'Notifications' }
];

const notificationsData = {
  today: [
    {
      id: 1,
      type: 'warning',
      avatar: 'TK',
      title: 'TKT-1109 (Billing issue)',
      description: 'is nearing SLA breach in 4m',
      assignedTo: 'Assigned to: Olivia Houghton',
      time: '15m ago',
      priority: 'High',
      timeLeft: '4m',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      avatar: 'TK',
      title: 'TKT-1011 (Login problem)',
      description: 'is nearing SLA breach in 9m',
      assignedTo: 'Reece Martin is assigned',
      time: '21m ago',
      priority: 'High',
      timeLeft: '9m',
      unread: true
    },
    {
      id: 3,
      type: 'mention',
      avatar: 'JS',
      title: 'Julia Smith',
      description: 'mentioned you: "@Alex, can you review this ticket from yesterday?"',
      ticketId: 'TKT-1078',
      ticketTitle: '(Account issue)',
      time: '38m ago',
      timeLeft: '38m',
      unread: true
    },
    {
      id: 8,
      type: 'event',
      avatar: 'QS',
      title: 'New client added to queue',
      description: 'Client John Doe was added to the support queue',
      time: '45m ago',
      timeLeft: '45m',
      unread: false
    },
       {
      id: 8,
      type: 'event',
      avatar: 'QS',
      title: 'New client added to queue',
      description: 'Client John Doe was added to the support queue',
      time: '45m ago',
      timeLeft: '45m',
      unread: false
    },
    
    {
      id: 9,
      type: 'event',
      avatar: 'AS',
      title: 'Agent assigned to client',
      description: 'You were assigned to client Jane Roe',
      time: '1h ago',
      timeLeft: '1h',
      unread: true
    },
    {
      id: 10,
      type: 'email',
      avatar: 'LM',
      title: 'New ticket (Email) from mark.lane',
      description: 'Customer reports issue with billing',
      ticketId: 'TKT-1120',
      ticketTitle: '(Billing)',
      time: '2h ago',
      timeLeft: '2h',
      unread: false
    }
  ],
  yesterday: [
    {
      id: 4,
      type: 'email',
      avatar: 'DJ',
      title: 'New ticket (Email)',
      description: 'from david.jones@email.com: "I need help updating my contact information"',
      ticketId: 'TKT-1055',
      ticketTitle: '(Account issue)',
      time: '1 day ago',
      timeLeft: '1d',
      unread: true
    },
    {
      id: 5,
      type: 'event',
      avatar: 'SY',
      title: '16 new tickets auto-assigned to team',
      subtitle: 'Event',
      time: '1 day ago',
      timeLeft: '1d',
      unread: true
    },
    {
      id: 6,
      type: 'event',
      avatar: 'SY',
      title: 'New peak of 34 new tickets in 10am-11am hour',
      subtitle: 'Event',
      time: '1 day ago',
      timeLeft: '1d',
      unread: true
    },
    {
      id: 7,
      type: 'feedback',
      avatar: 'FB',
      title: 'Feedback flagged as negative',
      description: '"Still waiting for a response..."',
      ticketId: 'TKT-028',
      ticketTitle: '(Refund request)',
      time: '1 day ago',
      timeLeft: '1d',
      unread: false
    },
    {
      id: 11,
      type: 'event',
      avatar: 'KR',
      title: 'New client added to queue',
      description: 'Client ACME Corp added to queue',
      time: '1 day ago',
      timeLeft: '1d',
      unread: false
    },
    {
      id: 12,
      type: 'mention',
      avatar: 'PS',
      title: 'Paul Smith',
      description: 'mentioned you in a note about ticket TKT-1001',
      ticketId: 'TKT-1001',
      ticketTitle: '(Login issue)',
      time: '1 day ago',
      timeLeft: '1d',
      unread: true
    }
  ]
};

const Notifications = () => {
  const [selectedTab, setSelectedTab] = React.useState('All');
  const [notifications, setNotifications] = React.useState(notificationsData);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState(null);
  const [dateFilter, setDateFilter] = React.useState('all');
  const [typeFilters, setTypeFilters] = React.useState({ queue: true, ticket: true });

  const toggleTypeFilter = (key) => {
    setTypeFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    // Mark as read
    if (notification.unread) {
      setNotifications(prev => ({
        today: prev.today.map(n => n.id === notification.id ? { ...n, unread: false } : n),
        yesterday: prev.yesterday.map(n => n.id === notification.id ? { ...n, unread: false } : n)
      }));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => ({
      today: prev.today.map(n => ({ ...n, unread: false })),
      yesterday: prev.yesterday.map(n => ({ ...n, unread: false }))
    }));
  };

  const getFilteredNotifications = () => {
    // First narrow to queue-related events: new clients in queue or assignments
    const isQueueRelated = (n) => {
      const text = ((n.title || '') + ' ' + (n.description || '') + ' ' + (n.subtitle || '')).toLowerCase();
      return (
        text.includes('new client') ||
        text.includes('new ticket') ||
        text.includes('added to queue') ||
        text.includes('auto-assigned') ||
        text.includes('assigned to') ||
        text.includes('assigned') ||
        text.includes('added to queue') ||
        text.includes('new peak') ||
        (n.type === 'event')
      );
    };

    let filtered = {
      today: notifications.today.filter(isQueueRelated),
      yesterday: notifications.yesterday.filter(isQueueRelated)
    };

    // Further filter by type toggles (queue / ticket)
    const matchesTypeFilter = (n) => {
      const title = ((n.title || '') + ' ' + (n.description || '')).toLowerCase();
      const isQueue = title.includes('queue') || title.includes('client') || n.type === 'event';
      const isTicket = title.includes('tkt') || n.type === 'email' || n.type === 'warning' || n.type === 'feedback' || n.type === 'mention';
      if (!typeFilters.queue && isQueue) return false;
      if (!typeFilters.ticket && isTicket) return false;
      return true;
    };

    filtered = {
      today: filtered.today.filter(matchesTypeFilter),
      yesterday: filtered.yesterday.filter(matchesTypeFilter)
    };

    // Filter by read status
    if (selectedTab === 'Unread') {
      filtered = {
        today: filtered.today.filter(n => n.unread),
        yesterday: filtered.yesterday.filter(n => n.unread)
      };
    }

    // Filter by date
    if (dateFilter === 'today') {
      return {
        today: filtered.today,
        yesterday: []
      };
    } else if (dateFilter === 'yesterday') {
      return {
        today: [],
        yesterday: filtered.yesterday
      };
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const getIcon = (type, avatar) => {
    const avatarStyle = {
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
      textTransform: 'uppercase'
    };

    let backgroundColor;
    switch (type) {
      case 'warning':
        backgroundColor = '#FF9800';
        break;
      case 'mention':
        backgroundColor = '#008E86';
        break;
      case 'email':
        backgroundColor = '#5B8A96';
        break;
      case 'event':
        backgroundColor = '#008E86';
        break;
      case 'feedback':
        backgroundColor = '#E57373';
        break;
      default:
        backgroundColor = '#9FBCBF';
    }

    return <div style={{ ...avatarStyle, backgroundColor }}>{avatar}</div>;
  };

  const NotificationItem = ({ notification }) => (
    <div
      onClick={() => handleNotificationClick(notification)}
      style={{
        padding: '10px 12px',
        display: 'flex',
        gap: '10px',
        backgroundColor: notification.unread ? '#C8E6E3' : '#fff',
        borderBottom: '1px solid #E6EBEE',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = notification.unread ? '#B5DCD8' : '#F8FAFB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.unread ? '#C8E6E3' : '#fff';
      }}
    >
      <div style={{ flexShrink: 0 }}>
        {getIcon(notification.type, notification.avatar)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#2C3E50', wordBreak: 'break-word' }}>
                {notification.title}
              </span>
              {notification.priority && (
                <span
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#FFF3E0',
                    color: '#FF9800',
                    fontSize: '9px',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  {notification.priority}
                </span>
              )}
            </div>
            {notification.description && (
              <div style={{ fontSize: '12px', color: '#7F8C9F', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {notification.description}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: '#A0AEC0', whiteSpace: 'nowrap' }}>
              {notification.timeLeft}
            </span>
            {notification.unread && (
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#008E86'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      <Breadcrumbs
        heading="Notifications"
        links={breadcrumbLinks}
        subheading="View and manage your notifications here."
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 2.5 }, alignItems: 'flex-start', marginBottom: '8px' }}>
        {/* Sidebar */}
        <Box component="aside" sx={{ width: { xs: '100%', md: '260px' }, padding: '0', position: { xs: 'static', md: 'sticky' }, top: '96px', alignSelf: 'flex-start' }}>
          {/* Filters Card */}
          <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: { xs: 1.5, sm: 1.5 }, marginBottom: 1.5 }}>
            <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '15px', color: '#2C3E50', fontWeight: 600 }}>Filters</h4>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <label style={{ fontSize: '13px', color: '#718096', fontWeight: 500 }}>Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#2C3E50',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                </select>
              </Box>

              <Box>
                <label style={{ fontSize: '13px', color: '#718096', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Type</label>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <button
                    onClick={() => toggleTypeFilter('queue')}
                    style={{
                      padding: '7px 8px',
                      backgroundColor: typeFilters.queue ? '#008E86' : 'transparent',
                      color: typeFilters.queue ? '#fff' : '#718096',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      flex: '1',
                      minWidth: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Queue
                  </button>
                  <button
                    onClick={() => toggleTypeFilter('ticket')}
                    style={{
                      padding: '7px 8px',
                      backgroundColor: typeFilters.ticket ? '#008E86' : 'transparent',
                      color: typeFilters.ticket ? '#fff' : '#718096',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      flex: '1',
                      minWidth: 0,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Ticket
                  </button>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* View Card */}
          <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: { xs: 1.5, sm: 1.5 } }}>
            <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '15px', color: '#2C3E50', fontWeight: 600 }}>View</h4>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['All', 'Unread'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  style={{
                    padding: '7px 12px',
                    backgroundColor: selectedTab === tab ? '#008E86' : 'transparent',
                    color: selectedTab === tab ? '#fff' : '#718096',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedTab === tab ? 600 : 500,
                    textAlign: 'left'
                  }}
                >
                  {tab}
                </button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Main Content Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 1.5 } }}>
            {/* Today Section */}
            {filteredNotifications.today.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <Box sx={{ padding: { xs: '10px 12px', sm: '14px 16px' }, borderBottom: '1px solid #E6EBEE', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#2C3E50' }}>Today</h3>
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      padding: '7px 12px',
                      backgroundColor: '#fff',
                      color: '#008E86',
                      border: '1px solid #008E86',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#008E86';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.color = '#008E86';
                    }}
                  >
                    Mark all as Read
                  </button>
                </Box>
                <div>
                  {filteredNotifications.today.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday Section */}
            {filteredNotifications.yesterday.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <Box sx={{ padding: { xs: '10px 12px', sm: '14px 16px' }, borderBottom: '1px solid #E6EBEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#2C3E50' }}>Yesterday</h3>
                </Box>
                <div>
                  {filteredNotifications.yesterday.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredNotifications.today.length === 0 && filteredNotifications.yesterday.length === 0 && (
              <Box sx={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: { xs: '40px 20px', sm: '60px 20px' }, textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', color: '#CBD5E0' }}>🔔</div>
                <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>No unread notifications</p>
              </Box>
            )}
          </Box>

        </div>
      </Box>

      {/* Notification Modal */}
      {isModalOpen && selectedNotification && (
        <Box
          onClick={handleCloseModal}
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
            padding: { xs: 1, sm: 2 }
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{ flexShrink: 0 }}>
                  {getIcon(selectedNotification.type, selectedNotification.avatar)}
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, wordBreak: 'break-word' }}>
                  {selectedNotification.title}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
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
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              {selectedNotification.description && (
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
                  {selectedNotification.description}
                </p>
              )}

              {selectedNotification.priority && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    backgroundColor: '#FFF3E0',
                    color: '#FF9800',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}
                >
                  {selectedNotification.priority} Priority
                </span>
              )}

              <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                {selectedNotification.assignedTo && (
                  <p style={{ margin: '6px 0' }}>
                    <strong>Assigned to:</strong> {selectedNotification.assignedTo}
                  </p>
                )}
                {selectedNotification.ticketId && (
                  <p style={{ margin: '6px 0' }}>
                    <strong>Ticket ID:</strong>{' '}
                    <span
                      style={{
                        padding: '2px 7px',
                        backgroundColor: '#E0F0F1',
                        color: '#008E86',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}
                    >
                      {selectedNotification.ticketId}
                    </span>{' '}
                    {selectedNotification.ticketTitle}
                  </p>
                )}
                {selectedNotification.subtitle && (
                  <p style={{ margin: '6px 0' }}>
                    <strong>Type:</strong> {selectedNotification.subtitle}
                  </p>
                )}
                {selectedNotification.time && (
                  <p style={{ margin: '6px 0' }}>
                    <strong>Time:</strong> {selectedNotification.time}
                  </p>
                )}
              </div>
            </div>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, marginTop: 2, paddingTop: 2, borderTop: '1px solid #E6EBEE' }}>
              {selectedNotification.ticketId && (
                <button
                  style={{
                    padding: '9px 20px',
                    backgroundColor: '#008E86',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  View Ticket
                </button>
              )}
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '9px 20px',
                  backgroundColor: '#F7FAFC',
                  color: '#2C3E50',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </Box>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default Notifications;