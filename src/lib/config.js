// Application Configuration
const API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const CORE_API_HOST = import.meta.env.VITE_CORE_API_BASE_URL || 'http://localhost:5000';
export const API_BASE_URL = `${API_HOST}/api`;
export const CORE_API_BASE_URL = `${CORE_API_HOST}/api`;
export const IDENTITY_API_BASE_URL =
  import.meta.env.VITE_IDENTITY_API_BASE_URL || `${API_HOST}/api`;
export const GRADING_API_BASE_URL =
  import.meta.env.VITE_GRADING_API_BASE_URL || API_BASE_URL;
export const SIGNALR_HUB_PATH = import.meta.env.VITE_SIGNALR_HUB_PATH || '/hubs/notifications';
export const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || `${API_HOST}${SIGNALR_HUB_PATH}`;
const DEFAULT_AUTH_TOKEN_KEY = import.meta.env.VITE_SIGNALR_TOKEN_KEY || 'access_token';

export const CONFIG = {
  API_BASE_URL,
  API_HOST,
  CORE_API_BASE_URL,
  CORE_API_HOST,
  IDENTITY_API_BASE_URL,
  GRADING_API_BASE_URL,
  SIGNALR_HUB_URL,
  UPLOAD_MAX_SIZE: 600 * 1024 * 1024, // 600 MB
  REQUEST_TIMEOUT: 600000, // 10 minutes
  SIGNALR: {
    HUB_URL: SIGNALR_HUB_URL,
    HUB_PATH: SIGNALR_HUB_PATH,
    AUTH_TOKEN_KEY: DEFAULT_AUTH_TOKEN_KEY,
    STATIC_TOKEN: import.meta.env.VITE_SIGNALR_STATIC_TOKEN || '',
    LOG_LEVEL: import.meta.env.VITE_SIGNALR_LOG_LEVEL || 'information',
    RECONNECT_DELAYS: [0, 2000, 5000, 10000],
  },
};

export default CONFIG;

