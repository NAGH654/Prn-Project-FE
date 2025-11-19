import './NotificationTray.css';

const STATUS_LABELS = {
  connected: 'Connected',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  idle: 'Idle',
  unauthenticated: 'Token missing',
  error: 'Error',
};

const formatTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return value;
  }
};

const NotificationTray = ({ status = 'idle', notifications = [], onClear }) => {
  const label = STATUS_LABELS[status] || status;
  const hasNotifications = notifications.length > 0;
  const statusClass = `status-${status}`;

  return (
    <section className={`notification-tray ${hasNotifications ? 'notification-tray--active' : ''}`}>
      <header className="notification-tray__header">
        <div className="notification-tray__title-block">
          <span className="notification-tray__live-pill" aria-label="Live notification feed">
            <span className={`notification-tray__pulse ${statusClass}`} aria-hidden="true" />
            Live
          </span>
          <p className="notification-tray__title">Real-time notifications</p>
          <span className={`notification-tray__status badge-${status}`}>{label}</span>
        </div>
        <div className="notification-tray__actions">
          <span className="notification-tray__count">
            {notifications.length} {notifications.length === 1 ? 'event' : 'events'}
          </span>
          <button
            type="button"
            className="notification-tray__clear"
            onClick={onClear}
            disabled={!notifications.length}
          >
            Clear
          </button>
        </div>
      </header>
      <ul className="notification-tray__list">
        {notifications.length === 0 ? (
          <li className="notification-tray__empty">No notifications received yet</li>
        ) : (
          notifications.map((item) => (
            <li key={item.id} className="notification-tray__item">
              <div className="notification-tray__item-header">
                <span className="notification-tray__event">{item.eventType}</span>
                <time className="notification-tray__time">{formatTime(item.timestamp)}</time>
              </div>
              <p className="notification-tray__message">{item.message}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default NotificationTray;

