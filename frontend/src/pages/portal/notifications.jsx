import React from 'react'
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
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '11px',
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
        padding: '8px 16px',
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
      <div>
        {getIcon(notification.type, notification.avatar)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#2C3E50' }}>
                {notification.title}
              </span>
              {notification.priority && (
                <span
                  style={{
                    padding: '2px 8px',
                    backgroundColor: '#FFF3E0',
                    color: '#FF9800',
                    fontSize: '10px',
                    fontWeight: 600,
                    borderRadius: '10px'
                  }}
                >
                  {notification.priority}
                </span>
              )}
            </div>
            {notification.description && (
              <div style={{ fontSize: '13px', color: '#7F8C9F', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {notification.description}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', color: '#A0AEC0', whiteSpace: 'nowrap' }}>
              {notification.timeLeft}
            </span>
            {notification.unread && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '8px' }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', padding: '0', position: 'sticky', top: '96px', alignSelf: 'flex-start' }}>
          {/* Filters Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '12px', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', color: '#2C3E50' }}>Filters</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#2C3E50',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '14px', color: '#718096', fontWeight: 500 }}>Type</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => toggleTypeFilter('queue')}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: typeFilters.queue ? '#008E86' : 'transparent',
                      color: typeFilters.queue ? '#fff' : '#718096',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Queue
                  </button>
                  <button
                    onClick={() => toggleTypeFilter('ticket')}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: typeFilters.ticket ? '#008E86' : 'transparent',
                      color: typeFilters.ticket ? '#fff' : '#718096',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* View Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '12px' }}>
            <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', color: '#2C3E50' }}>View</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {['All', 'Unread'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedTab === tab ? '#008E86' : 'transparent',
                    color: selectedTab === tab ? '#fff' : '#718096',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: selectedTab === tab ? 600 : 400,
                    textAlign: 'left'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Today Section */}
            {filteredNotifications.today.length > 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E6EBEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#2C3E50' }}>Today</h3>
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#fff',
                      color: '#008E86',
                      border: '1px solid #008E86',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
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
                </div>
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
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E6EBEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#2C3E50' }}>Yesterday</h3>
                </div>
                <div>
                  {filteredNotifications.yesterday.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredNotifications.today.length === 0 && filteredNotifications.yesterday.length === 0 && (
              <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', color: '#CBD5E0' }}>🔔</div>
                <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>No unread notifications</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Notification Modal */}
      {isModalOpen && selectedNotification && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '4px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getIcon(selectedNotification.type, selectedNotification.avatar)}
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                  {selectedNotification.title}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              {selectedNotification.description && (
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  {selectedNotification.description}
                </p>
              )}

              {selectedNotification.priority && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#FFF3E0',
                    color: '#FF9800',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}
                >
                  {selectedNotification.priority} Priority
                </span>
              )}

              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                {selectedNotification.assignedTo && (
                  <p style={{ margin: '8px 0' }}>
                    <strong>Assigned to:</strong> {selectedNotification.assignedTo}
                  </p>
                )}
                {selectedNotification.ticketId && (
                  <p style={{ margin: '8px 0' }}>
                    <strong>Ticket ID:</strong>{' '}
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#E0F0F1',
                        color: '#008E86',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {selectedNotification.ticketId}
                    </span>{' '}
                    {selectedNotification.ticketTitle}
                  </p>
                )}
                {selectedNotification.subtitle && (
                  <p style={{ margin: '8px 0' }}>
                    <strong>Type:</strong> {selectedNotification.subtitle}
                  </p>
                )}
                {selectedNotification.time && (
                  <p style={{ margin: '8px 0' }}>
                    <strong>Time:</strong> {selectedNotification.time}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E6EBEE' }}>
              {selectedNotification.ticketId && (
                <button
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#008E86',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  View Ticket
                </button>
              )}
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#F7FAFC',
                  color: '#2C3E50',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Notifications;