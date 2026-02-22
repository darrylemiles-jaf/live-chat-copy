import { useEffect, useRef } from 'react';
import { getCurrentUser } from 'utils/auth';
import Users from 'api/users';
import socketService from 'services/socketService';
import { API_URL } from 'constants/constants';

/**
 * Hook to automatically set user status to 'away' when:
 * - User logs out
 * - User closes the browser tab/window
 * - User navigates away from the app
 * - Page visibility changes (tab switch)
 */
const useStatusSync = () => {
  const hasSetAwayRef = useRef(false);
  const lastStatusRef = useRef(null);

  const setUserAway = async () => {
    if (hasSetAwayRef.current) return; // Prevent duplicate calls

    const user = getCurrentUser();
    if (!user?.id) return;

    try {
      hasSetAwayRef.current = true;
      console.log('🔄 Setting user status to away (logout/close detected)');

      // Use sendBeacon for reliable delivery even when page is closing
      const apiUrl = `${API_URL}/api/${import.meta.env.VITE_API_VER}/users/${user.id}/status`;
      const token = localStorage.getItem('serviceToken');

      const data = JSON.stringify({ status: 'away' });
      const blob = new Blob([data], { type: 'application/json' });

      // Try sendBeacon first (works during page unload)
      const beaconSent = navigator.sendBeacon
        ? navigator.sendBeacon(apiUrl, blob)
        : false;

      if (!beaconSent) {
        // Fallback to synchronous fetch if sendBeacon not available or fails
        await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: data,
          keepalive: true // Keep request alive during page unload
        });
      }
    } catch (error) {
      console.error('Failed to set user away on logout:', error);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id) return;

    // Handle page visibility changes (tab switching)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        lastStatusRef.current = 'away';
        try {
          await Users.updateUserStatus(user.id, 'away');
          console.log('📵 Tab hidden: status set to away');
        } catch (error) {
          console.error('Failed to set away on visibility change:', error);
        }
      } else if (document.visibilityState === 'visible') {
        // Optionally restore last active status when tab becomes visible again
        // For now, we'll let the user manually change it back if needed
        console.log('👁️ Tab visible again');
      }
    };

    // Handle before page unload (closing tab/window, navigating away)
    const handleBeforeUnload = (e) => {
      setUserAway();
      // Note: Modern browsers ignore custom messages in beforeunload
    };

    // Handle page unload/pagehide (backup for beforeunload)
    const handleUnload = () => {
      setUserAway();
    };

    // Override logout function to set status to away
    const originalLogout = window.logout;
    window.logout = () => {
      setUserAway();
      if (originalLogout) originalLogout();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleUnload);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleUnload);
      window.logout = originalLogout;
    };
  }, []);

  // Listen for real-time status updates from other sessions
  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id) return;

    const handleStatusUpdate = (data) => {
      // If this status update is for the current user from another session
      if (data.userId === user.id) {
        console.log('📡 Received status update for current user from another session:', data.status);
        // Update local storage or state if needed
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...parsed, status: data.status }));
          }
        } catch (e) {
          console.error('Failed to update local user status:', e);
        }
      }
    };

    const socket = socketService.socket;
    if (socket) {
      socket.on('user_status_changed', handleStatusUpdate);
    }

    return () => {
      const s = socketService.socket;
      if (s) {
        s.off('user_status_changed', handleStatusUpdate);
      }
    };
  }, []);

  return null; // This hook doesn't return anything, it just runs side effects
};

export default useStatusSync;
