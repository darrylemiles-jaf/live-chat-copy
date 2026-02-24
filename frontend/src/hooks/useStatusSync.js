import { useEffect, useRef } from 'react';
import { getCurrentUser } from 'utils/auth';
import socketService from 'services/socketService';
import { API_URL } from 'constants/constants';

/**
 * Hook to automatically set user status to 'away' when:
 * - User logs out
 * - User closes the browser tab/window
 * - User navigates away from the app
 *
 * Status changes driven by chat assignment are handled server-side:
 * - Auto/manual assign → 'busy'
 * - Chat end (no remaining active chats) → 'available'
 */
const useStatusSync = () => {
  const hasSetAwayRef = useRef(false);

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
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleUnload);

    // Cleanup
    return () => {
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
