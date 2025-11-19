import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { CONFIG } from '@lib/config';

const KNOWN_EVENTS = [
  'SubmissionUploaded',
  'SubmissionGraded',
  'ViolationDetected',
  'Notification',
];

const LOG_LEVEL_MAP = {
  trace: LogLevel.Trace,
  debug: LogLevel.Debug,
  information: LogLevel.Information,
  info: LogLevel.Information,
  warning: LogLevel.Warning,
  warn: LogLevel.Warning,
  error: LogLevel.Error,
  critical: LogLevel.Critical,
  none: LogLevel.None,
};

const resolveLogLevel = (value) => {
  if (!value) return LogLevel.Information;
  const normalized = String(value).toLowerCase();
  return LOG_LEVEL_MAP[normalized] ?? LogLevel.Information;
};

class NotificationHubClient {
  constructor() {
    this.connection = null;
    this.boundEvents = new Set();
    this.listeners = new Map();
    this.statusListeners = new Set();
    this.status = 'idle';
    this.lastError = null;
    this.startPromise = null;
    this.accessTokenProvider = null;

    KNOWN_EVENTS.forEach((event) => {
      this.listeners.set(event, new Set());
    });
  }

  getStatus() {
    return this.status;
  }

  getLastError() {
    return this.lastError;
  }

  setAccessTokenProvider(fn) {
    this.accessTokenProvider = fn;
  }

  onStatusChange(callback) {
    if (typeof callback !== 'function') return () => {};
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  on(eventName, handler) {
    if (typeof handler !== 'function') return () => {};
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    const handlers = this.listeners.get(eventName);
    handlers.add(handler);
    if (this.connection) {
      this.ensureEventBinding(eventName);
    }
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) return;
    handlers.delete(handler);
  }

  emit(eventName, payload) {
    const handlers = this.listeners.get(eventName);
    if (!handlers || handlers.size === 0) return;
    handlers.forEach((callback) => {
      try {
        callback(payload, eventName);
      } catch (error) {
        console.error(`[SignalR] Handler error for ${eventName}`, error);
      }
    });
  }

  async start() {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this.buildAndStart();
    try {
      await this.startPromise;
      return this.connection;
    } finally {
      this.startPromise = null;
    }
  }

  async buildAndStart() {
    const token = this.fetchAccessToken();
    if (!token) {
      this.updateStatus('unauthenticated');
      return null;
    }

    this.updateStatus('connecting');
    this.lastError = null;

    const builder = new HubConnectionBuilder()
      .withUrl(CONFIG.SIGNALR.HUB_URL, {
        accessTokenFactory: () => this.fetchAccessToken() || '',
      })
      .withAutomaticReconnect(CONFIG.SIGNALR.RECONNECT_DELAYS)
      .configureLogging(resolveLogLevel(CONFIG.SIGNALR.LOG_LEVEL));

    this.connection = builder.build();
    this.bindConnectionLifecycle();
    this.boundEvents.clear();
    this.listeners.forEach((_, eventName) => this.ensureEventBinding(eventName));

    try {
      await this.connection.start();
      this.updateStatus('connected');
    } catch (error) {
      this.lastError = error;
      this.updateStatus('error');
      console.error('[SignalR] Failed to start connection', error);
      throw error;
    }

    return this.connection;
  }

  bindConnectionLifecycle() {
    if (!this.connection) return;
    this.connection.onclose((error) => {
      if (error) {
        this.lastError = error;
        console.error('[SignalR] Connection closed', error);
      }
      this.updateStatus('disconnected');
    });
    this.connection.onreconnecting((error) => {
      if (error) {
        this.lastError = error;
        console.warn('[SignalR] Reconnecting', error);
      }
      this.updateStatus('reconnecting');
    });
    this.connection.onreconnected(() => {
      this.lastError = null;
      this.updateStatus('connected');
    });
  }

  ensureEventBinding(eventName) {
    if (!this.connection || this.boundEvents.has(eventName)) return;
    this.connection.on(eventName, (payload) => this.emit(eventName, payload));
    this.boundEvents.add(eventName);
  }

  async ensureStarted() {
    try {
      return await this.start();
    } catch (error) {
      return null;
    }
  }

  async stop() {
    if (!this.connection) {
      this.updateStatus('idle');
      return;
    }
    try {
      await this.connection.stop();
    } catch (error) {
      console.error('[SignalR] Error while stopping connection', error);
    } finally {
      this.connection = null;
      this.boundEvents.clear();
      this.updateStatus('idle');
    }
  }

  async subscribeToExam(examId) {
    if (!examId) return;
    const connection = await this.ensureStarted();
    if (!connection) return;
    try {
      await connection.invoke('SubscribeToExam', examId);
    } catch (error) {
      console.error('[SignalR] Failed to subscribe to exam', error);
    }
  }

  async unsubscribeFromExam(examId) {
    if (!examId || !this.connection) return;
    try {
      await this.connection.invoke('UnsubscribeFromExam', examId);
    } catch (error) {
      console.error('[SignalR] Failed to unsubscribe from exam', error);
    }
  }

  async subscribeToManagers() {
    const connection = await this.ensureStarted();
    if (!connection) return;
    await connection.invoke('SubscribeToManagerNotifications').catch((error) => {
      console.error('[SignalR] Failed to subscribe managers', error);
    });
  }

  async subscribeToModerators() {
    const connection = await this.ensureStarted();
    if (!connection) return;
    await connection.invoke('SubscribeToModeratorNotifications').catch((error) => {
      console.error('[SignalR] Failed to subscribe moderators', error);
    });
  }

  async subscribeToExaminers() {
    const connection = await this.ensureStarted();
    if (!connection) return;
    await connection.invoke('SubscribeToExaminerNotifications').catch((error) => {
      console.error('[SignalR] Failed to subscribe examiners', error);
    });
  }

  fetchAccessToken() {
    if (this.accessTokenProvider) {
      try {
        const value = this.accessTokenProvider();
        if (value) return value;
      } catch (error) {
        console.warn('[SignalR] accessTokenProvider error', error);
      }
    }

    if (typeof window !== 'undefined') {
      const storageKey = CONFIG.SIGNALR.AUTH_TOKEN_KEY;
      const token =
        window.localStorage?.getItem(storageKey) ||
        window.sessionStorage?.getItem(storageKey) ||
        CONFIG.SIGNALR.STATIC_TOKEN ||
        '';
      return token?.trim() || null;
    }

    return CONFIG.SIGNALR.STATIC_TOKEN || null;
  }

  updateStatus(status) {
    if (this.status === status) return;
    this.status = status;
    this.statusListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('[SignalR] Status listener error', error);
      }
    });
  }
}

export const notificationHub = new NotificationHubClient();

export default notificationHub;

