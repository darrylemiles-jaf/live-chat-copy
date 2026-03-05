import React from 'react';
import { Box } from '@mui/material';

import PageHead from '../../components/PageHead';
import NotificationFiltersSection from '../../sections/notifications/NotificationFiltersSection';
import NotificationListSection from '../../sections/notifications/NotificationListSection';
import NotificationModal from '../../sections/notifications/NotificationModal';
import useNotifications from '../../hooks/useNotifications';

const Notifications = () => {
  const {
    selectedTab,
    loading,
    initialLoading,
    hasMore,
    unreadCount,
    isModalOpen,
    selectedNotification,
    dateFilter,
    typeFilters,
    filteredNotifications,
    groupedNotifications,
    groupKeys,
    setSelectedTab,
    setDateFilter,
    toggleTypeFilter,
    handleNotificationClick,
    handleCloseModal,
    handleMarkAllAsRead,
    handleGoToChat,
    handleLoadMore,
  } = useNotifications();

  return (
    <React.Fragment>
      <PageHead title="Notifications" description="Timora Live Chat, Notifications Overview" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1.5, md: 2.5 },
          alignItems: 'flex-start',
          marginBottom: '8px',
        }}
      >
        <NotificationFiltersSection
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          typeFilters={typeFilters}
          onToggleTypeFilter={toggleTypeFilter}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          unreadCount={unreadCount}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <NotificationListSection
            initialLoading={initialLoading}
            loading={loading}
            groupedNotifications={groupedNotifications}
            groupKeys={groupKeys}
            filteredNotifications={filteredNotifications}
            unreadCount={unreadCount}
            hasMore={hasMore}
            selectedTab={selectedTab}
            onNotificationClick={handleNotificationClick}
            onMarkAllAsRead={handleMarkAllAsRead}
            onLoadMore={handleLoadMore}
          />
        </div>
      </Box>

      {isModalOpen && (
        <NotificationModal
          notification={selectedNotification}
          onClose={handleCloseModal}
          onGoToChat={handleGoToChat}
        />
      )}
    </React.Fragment>
  );
};

export default Notifications;