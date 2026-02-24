import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentUser, logout } from 'utils/auth';

/** How long (ms) of inactivity before showing the warning modal */
const INACTIVITY_MS = 3000; // 1 minute

/** Seconds user has to respond once the modal appears */
const COUNTDOWN_SEC = 5;

/** DOM events that count as "activity" */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * useAutoLogout
 *
 * Returns { modalOpen, countdown, handleStayLoggedIn }
 *
 * Starts a 1-minute inactivity timer.  When it fires, shows the modal and
 * begins a 30-second countdown.  If the user clicks "Stay Logged In" (or
 * any activity event triggers before the countdown ends) the state resets.
 * If the countdown reaches 0, logout() is called automatically.
 */
export default function useAutoLogout() {
  const [modalOpen, setModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);

  // refs so callbacks always see fresh values without re-registering listeners
  const inactivityTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const modalOpenRef = useRef(false);

  // ── helpers ───────────────────────────────────────────────────────────────

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SEC);
    clearCountdown();

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  const showModal = useCallback(() => {
    modalOpenRef.current = true;
    setModalOpen(true);
    startCountdown();
  }, [startCountdown]);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(showModal, INACTIVITY_MS);
  }, [clearInactivityTimer, showModal]);

  // Reset everything and restart the inactivity timer
  const resetAll = useCallback(() => {
    clearCountdown();
    clearInactivityTimer();
    modalOpenRef.current = false;
    setModalOpen(false);
    setCountdown(COUNTDOWN_SEC);
    startInactivityTimer();
  }, [clearCountdown, clearInactivityTimer, startInactivityTimer]);

  // Called when user clicks "Stay Logged In"
  const handleStayLoggedIn = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // ── activity listener ─────────────────────────────────────────────────────

  const handleActivity = useCallback(() => {
    // If modal is already open, activity alone doesn't dismiss it —
    // only the explicit "Stay Logged In" button does.
    if (modalOpenRef.current) return;
    startInactivityTimer();
  }, [startInactivityTimer]);

  // ── effect ────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Only run when a user is actually logged in
    if (!getCurrentUser()?.id) return;

    // Kick off the first timer
    startInactivityTimer();

    // Register activity listeners
    ACTIVITY_EVENTS.forEach((evt) => document.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      clearInactivityTimer();
      clearCountdown();
      ACTIVITY_EVENTS.forEach((evt) => document.removeEventListener(evt, handleActivity));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { modalOpen, countdown, handleStayLoggedIn };
}
