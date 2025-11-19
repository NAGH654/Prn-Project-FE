import { useEffect, useMemo, useState } from 'react';
import notificationHub from '@services/notificationHub';

/**
 * React hook to interact with the SignalR notification hub
 */
export const useNotificationHub = ({
  enabled = true,
  handlers = {},
  examId,
  autoSubscribeManagers = false,
  autoSubscribeModerators = false,
  autoSubscribeExaminers = false,
} = {}) => {
  const [status, setStatus] = useState(notificationHub.getStatus());
  const [lastError, setLastError] = useState(notificationHub.getLastError());
  const handlerEntries = useMemo(
    () => Object.entries(handlers || {}).filter(([, handler]) => typeof handler === 'function'),
    [handlers]
  );

  useEffect(() => {
    const unsubscribe = notificationHub.onStatusChange((nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus === 'error') {
        setLastError(notificationHub.getLastError());
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    notificationHub.start().catch((error) => {
      if (!cancelled) {
        setLastError(error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || handlerEntries.length === 0) return undefined;
    const cleanups = handlerEntries.map(([eventName, handler]) =>
      notificationHub.on(eventName, handler)
    );
    return () => cleanups.forEach((cleanup) => cleanup?.());
  }, [enabled, handlerEntries]);

  useEffect(() => {
    if (!enabled || !examId) return undefined;
    notificationHub.subscribeToExam(examId);
    return () => {
      notificationHub.unsubscribeFromExam(examId);
    };
  }, [enabled, examId]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (autoSubscribeManagers) {
      notificationHub.subscribeToManagers();
    }
    if (autoSubscribeModerators) {
      notificationHub.subscribeToModerators();
    }
    if (autoSubscribeExaminers) {
      notificationHub.subscribeToExaminers();
    }
  }, [enabled, autoSubscribeManagers, autoSubscribeModerators, autoSubscribeExaminers]);

  return {
    status,
    lastError,
    isConnected: status === 'connected',
    reconnect: () => notificationHub.start(),
    stop: () => notificationHub.stop(),
  };
};

export default useNotificationHub;

