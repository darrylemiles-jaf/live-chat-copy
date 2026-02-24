import { useEffect, useRef } from 'react';
import { getCurrentUser } from 'utils/auth';
import Users from 'api/users';
import socketService from 'services/socketService';
import { API_URL } from 'constants/constants';

const INACTIVITY_MS = 60_000; // 1 minute â†’ away

const useStatusSync = () => {
  const timerRef = useRef(null);
  const currentStatusRef = useRef(null);  // null forces the first API call
  const isAwayFromIdleRef = useRef(false);
  const manualOverrideRef = useRef(false);
  const beaconSentRef = useRef(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id) return;

    // â”€â”€ persist status to localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const persist = (status) => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), status }));
      } catch { /* ignore */ }
    };

    // â”€â”€ call API to change status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const applyStatus = async (status) => {
      if (currentStatusRef.current === status) return;
      console.log(`ðŸ”„ [StatusSync] â†’ ${status}`);
      try {
        const res = await Users.updateUserStatus(user.id, status);
        if (res?.success) {
          currentStatusRef.current = status;
          persist(status);
        }
      } catch (e) {
        console.error('[StatusSync] API error:', e.message);
      }
    };

    // â”€â”€ fetch server status; set available unless server says busy â”€â”€â”€â”€
    const applyActiveStatus = async () => {
      try {
        const res = await Users.getSingleUser(user.id);
        if (res?.success && res.data?.status === 'busy') {
          currentStatusRef.current = 'busy';
          persist('busy');
        } else {
          await applyStatus('available');
        }
      } catch {
        await applyStatus('available');
      }
    };

    // â”€â”€ inactivity timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (manualOverrideRef.current) return;
      timerRef.current = setTimeout(async () => {
        if (manualOverrideRef.current) return;
        if (document.visibilityState !== 'visible') return;
        console.log('â±ï¸ [StatusSync] idle 1 min â†’ away');
        isAwayFromIdleRef.current = true;
        await applyStatus('away');
      }, INACTIVITY_MS);
    };

    // â”€â”€ activity (restore from idle-away on first interaction) â”€â”€â”€â”€â”€â”€â”€â”€
    const onActivity = async () => {
      if (isAwayFromIdleRef.current && !manualOverrideRef.current) {
        isAwayFromIdleRef.current = false;
        await applyActiveStatus();
      }
      resetTimer();
    };

    // â”€â”€ tab visibility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const onVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        manualOverrideRef.current = false;
        isAwayFromIdleRef.current = true;
        await applyStatus('away');
        console.log('ðŸ“µ [StatusSync] tab hidden â†’ away');
      } else {
        beaconSentRef.current = false;
        if (!manualOverrideRef.current) {
          isAwayFromIdleRef.current = false;
          await applyActiveStatus();
        }
        resetTimer();
        console.log('ðŸ‘ï¸ [StatusSync] tab visible â†’ active');
      }
    };

    // â”€â”€ page close â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sendAwayBeacon = () => {
      if (beaconSentRef.current) return;
      beaconSentRef.current = true;
      const apiUrl = `${API_URL}/api/${import.meta.env.VITE_API_VER}/users/${user.id}/status`;
      const token = localStorage.getItem('serviceToken');
      const body = JSON.stringify({ status: 'away' });
      const blob = new Blob([body], { type: 'application/json' });
      if (!navigator.sendBeacon?.(apiUrl, blob)) {
        fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body, keepalive: true
        }).catch(() => {});
      }
    };

    // â”€â”€ socket: sync when server changes status (chat assign/end) â”€â”€â”€â”€â”€
    const handleSocketStatus = (data) => {
      if (data.userId !== user.id) return;
      console.log(`ðŸ“¡ [StatusSync] socket â†’ ${data.status}`);
      currentStatusRef.current = data.status;
      persist(data.status);
      if (data.status !== 'away') {
        manualOverrideRef.current = false;
        isAwayFromIdleRef.current = false;
        resetTimer();
      }
    };

    // Socket may not be ready yet â€” retry until attached
    let socketAttached = false;
    const attachSocket = () => {
      const s = socketService.socket;
      if (s && !socketAttached) {
        s.on('user_status_changed', handleSocketStatus);
        socketAttached = true;
      }
    };
    attachSocket();
    const socketRetry = setInterval(() => { if (socketAttached) { clearInterval(socketRetry); return; } attachSocket(); }, 500);

    // â”€â”€ manual override from Settings drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const onManualOverride = () => {
      manualOverrideRef.current = true;
      isAwayFromIdleRef.current = false;
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      try {
        const stored = localStorage.getItem('user');
        if (stored) currentStatusRef.current = JSON.parse(stored).status || currentStatusRef.current;
      } catch { /* ignore */ }
    };

    // â”€â”€ override window.logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const origLogout = window.logout;
    window.logout = () => { sendAwayBeacon(); if (origLogout) origLogout(); };

    // â”€â”€ attach all listeners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    EVENTS.forEach(e => document.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', sendAwayBeacon);
    window.addEventListener('pagehide', sendAwayBeacon);
    window.addEventListener('manual_status_override', onManualOverride);

    // On mount: sync DB status, then start idle timer
    applyActiveStatus().then(() => resetTimer());

    return () => {
      EVENTS.forEach(e => document.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', sendAwayBeacon);
      window.removeEventListener('pagehide', sendAwayBeacon);
      window.removeEventListener('manual_status_override', onManualOverride);
      clearInterval(socketRetry);
      const s = socketService.socket;
      if (s && socketAttached) s.off('user_status_changed', handleSocketStatus);
      window.logout = origLogout;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
};

export default useStatusSync;
